import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { createInterface } from "readline";

interface CommitInfo {
  hash: string;
  author: string;
  date: string;
  message: string;
}

function getCurrentCommit(): CommitInfo {
  const hash = execSync("git rev-parse HEAD").toString().trim();
  const author = execSync('git log -1 --pretty=format:"%an"').toString().trim();
  const date = execSync('git log -1 --pretty=format:"%ad"').toString().trim();
  const message = execSync('git log -1 --pretty=format:"%B"').toString().trim();

  return { hash, author, date, message };
}

function getChangedFiles(): string[] {
  const output = execSync("git diff --cached --name-only").toString().trim();
  return output ? output.split("\n") : [];
}

function generatePrompt(
  commitInfo: CommitInfo,
  changedFiles: string[]
): string {
  return `กรุณาสร้างสรุปรายละเอียดของ commit ต่อไปนี้:

Commit Hash: ${commitInfo.hash}
Author: ${commitInfo.author}
Date: ${commitInfo.date}
Message: ${commitInfo.message}

ไฟล์ที่เปลี่ยนแปลง:
${changedFiles.map((file) => `- ${file}`).join("\n")}

กรุณาให้ข้อมูลดังนี้:
1. สรุปการเปลี่ยนแปลงอย่างกระชับ
2. การแก้ไขที่สำคัญในแต่ละไฟล์
3. ผลกระทบที่อาจเกิดขึ้นจากการเปลี่ยนแปลงเหล่านี้
4. การเปลี่ยนแปลงที่อาจทำให้เกิดปัญหา (breaking changes) หรือหมายเหตุสำคัญ`;
}

function saveSummary(
  summary: string,
  commitInfo: CommitInfo,
  changedFiles: string[]
): string {
  const summaryDir = path.join(
    process.cwd(),
    "__commit_logs__", //TODO: ตั้งชื่อได้ตามต้องการ
    "commit_summaries" //TODO: ตั้งชื่อได้ตามต้องการ
  );
  if (!fs.existsSync(summaryDir)) {
    fs.mkdirSync(summaryDir, { recursive: true });
  }

  const filename = `${new Date().toISOString().split("T")[0]}_${
    commitInfo.hash
  }.md`;
  const filepath = path.join(summaryDir, filename);

  const content = `# สรุปการ Commit

## รายละเอียด Commit
- **Hash:** ${commitInfo.hash}
- **ผู้เขียน:** ${commitInfo.author}
- **วันที่:** ${commitInfo.date}
- **ข้อความ:** ${commitInfo.message}

## สรุปที่สร้างโดย AI
${summary}

## ไฟล์ที่เปลี่ยนแปลง
${changedFiles.map((file: string) => `- ${file}`).join("\n")}
`;

  fs.writeFileSync(filepath, content);
  console.log(`บันทึกสรุปไปที่: ${filepath}`);

  return filepath;
}

async function main() {
  try {
    const commitInfo = getCurrentCommit();
    const changedFiles = getChangedFiles();

    // ตรวจสอบว่าไฟล์ที่เพิ่มใน staging area มีหรือไม่
    if (changedFiles.length === 0) {
      console.error(
        "ข้อผิดพลาด: ไม่มีไฟล์ที่เพิ่มใน staging area กรุณาใช้คำสั่ง 'git add {ชื่อไฟล์} หรือ git add .' เพื่อเพิ่มไฟล์ก่อนรันสคริปต์นี้"
      );
      process.exit(1);
    }

    console.log("กำลังสร้างสรุปการ commit...");
    console.log("หมายเหตุ: กรุณาใช้ LLM AI เพื่อวิเคราะห์คำขอต่อไปนี้:");
    console.log("\n" + generatePrompt(commitInfo, changedFiles));
    console.log(
      "\nหลังจากได้รับสรุปจาก LLM AI (เช่น OpenAI, Claude, Cursor, อื่นๆ.) แล้ว กรุณาบันทึกเพื่อดำเนินการต่อ"
    );

    //TODO: เชื่อมกับ LLM เช่น OpenAI, Cursor AI, Claude AI, อื่นๆ.

    // ใช้ readline แทนการใช้ process.stdin โดยตรง
    const readline = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log("\nกด Enter หลังจากที่คุณได้รับสรุปจาก LLM AI แล้ว...");

    // รอให้ผู้ใช้กด Enter
    await new Promise((resolve) => readline.question("", resolve));

    console.log(
      "กรุณาวางสรุปจาก LLM AI (กด Ctrl+D หรือ Ctrl+C เมื่อเสร็จสิ้น):"
    );

    let summary = "";

    // รับข้อมูลทีละบรรทัด
    for await (const line of readline) {
      summary += line + "\n";
    }

    // บันทึก summary และรับค่า filepath
    const filepath = saveSummary(summary.trim(), commitInfo, changedFiles);

    // เพิ่มไฟล์สรุป commit ใน git
    execSync(`git add "${filepath}"`);

    // สร้าง readline interface ใหม่สำหรับรับข้อความ commit
    const commitReadline = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // รับค่าจากผู้ใช้
    const commitMessage = await new Promise<string>((resolve) => {
      commitReadline.question("กรุณาป้อนข้อความ commit: ", resolve);
    });

    // ปิด readline
    commitReadline.close();

    // commit ไฟล์สรุป commit
    execSync(`git commit -m "${commitMessage}"`);

    // push ไฟล์สรุป commit
    execSync("git push");

    console.log("เพิ่ม, commit และ push ไฟล์สรุปการ commit เรียบร้อยแล้ว");

    process.exit(0);
  } catch (error) {
    console.error("ข้อผิดพลาด:", error);
    process.exit(1);
  }
}

main();
