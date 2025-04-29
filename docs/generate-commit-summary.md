# 📝 เอกสารอธิบายการทำงานของ generate-commit-summary.ts

**ผู้เขียน:** BemindLab
**วันที่เขียน:** 2025-04-29
**เวอร์ชัน:** 1.0.0

## 📋 สารบัญ
1. [ภาพรวม](#ภาพรวม)
2. [การติดตั้ง](#การติดตั้ง)
3. [การใช้งาน](#การใช้งาน)
4. [รายละเอียดการทำงาน](#รายละเอียดการทำงาน)
5. [ข้อควรระวัง](#ข้อควรระวัง)
6. [การปรับแต่ง](#การปรับแต่ง)

## 📋 สรุปภาพรวม
ไฟล์ `generate-commit-summary.ts` เป็นสคริปต์ที่ใช้สำหรับสร้างสรุปการ commit โดยอัตโนมัติ โดยจะรวบรวมข้อมูลจาก commit ปัจจุบัน สร้าง prompt สำหรับ AI และบันทึกผลลัพธ์ในรูปแบบไฟล์ Markdown

## 🔍 ฟังก์ชันหลัก

### 1. `getCurrentCommit()`
- ดึงข้อมูล commit ปัจจุบัน
- ข้อมูลที่ได้: hash, author, date, message
- ใช้คำสั่ง git เพื่อดึงข้อมูล

### 2. `getChangedFiles()`
- ดึงรายการไฟล์ที่เปลี่ยนแปลงใน staging area
- ใช้คำสั่ง `git diff --cached --name-only`

### 3. `generatePrompt()`
- สร้าง prompt สำหรับ AI
- ประกอบด้วย:
  - ข้อมูล commit
  - รายการไฟล์ที่เปลี่ยนแปลง
  - คำขอให้วิเคราะห์การเปลี่ยนแปลง

### 4. `saveSummary()`
- บันทึกสรุปลงในไฟล์ Markdown
- สร้างโฟลเดอร์ `__commit_logs__/commit_summaries`
- ตั้งชื่อไฟล์ตามวันที่และ hash ของ commit

## 📁 โครงสร้างไฟล์สรุป
```markdown
# สรุปการ Commit

## รายละเอียด Commit
- Hash: [commit hash]
- ผู้เขียน: [author name]
- วันที่: [commit date]
- ข้อความ: [commit message]

## สรุปที่สร้างโดย AI
[เนื้อหาสรุปจาก AI]

## ไฟล์ที่เปลี่ยนแปลง
[รายการไฟล์]
```

## 🔄 ขั้นตอนการทำงาน
1. ตรวจสอบไฟล์ใน staging area
2. สร้าง prompt สำหรับ AI
3. รอข้อมูลสรุปจากผู้ใช้
4. บันทึกสรุปลงไฟล์
5. เพิ่มไฟล์สรุปเข้า git
6. commit และ push การเปลี่ยนแปลง

## ⚠️ หมายเหตุ
- ต้องมีไฟล์ใน staging area ก่อนรันสคริปต์
- รองรับการเชื่อมต่อกับ LLM ต่างๆ (ยังไม่ได้ implement)
- สามารถปรับแต่งชื่อโฟลเดอร์และรูปแบบไฟล์ได้

## 🔧 การปรับแต่ง
- สามารถเปลี่ยนชื่อโฟลเดอร์ `__commit_logs__` และ `commit_summaries`
- สามารถปรับแต่งรูปแบบ prompt และไฟล์สรุปได้
- รองรับการเพิ่มการเชื่อมต่อกับ LLM ต่างๆ

## ข้อควรระวัง
1. **การเตรียมความพร้อม**
   - ต้องมีไฟล์ใน staging area ก่อนรันสคริปต์
   - ตรวจสอบสิทธิ์การเขียนไฟล์
   - ตรวจสอบการเชื่อมต่อกับ git repository

2. **ข้อจำกัด**
   - รองรับการเชื่อมต่อกับ LLM ต่างๆ (ยังไม่ได้ implement)
   - ต้องมีพื้นที่เพียงพอสำหรับบันทึกไฟล์สรุป
   - อาจใช้เวลานานในการสร้างสรุปหากมีการเปลี่ยนแปลงมาก

## การปรับแต่ง

### 1. การตั้งค่าโฟลเดอร์
```typescript
const CONFIG = {
    LOG_FOLDER: '__commit_logs__',
    SUMMARY_FOLDER: 'commit_summaries'
}
```

### 2. การปรับแต่ง Prompt
```typescript
const PROMPT_TEMPLATE = `
    Commit: {commit_hash}
    Author: {author}
    Date: {date}
    Message: {message}
    
    Changed Files:
    {changed_files}
    
    Please analyze these changes and provide a summary.
`
```

### 3. การเพิ่ม LLM Provider
```typescript
interface LLMProvider {
    generateSummary(prompt: string): Promise<string>;
}

// ตัวอย่างการเพิ่ม provider ใหม่
class NewLLMProvider implements LLMProvider {
    async generateSummary(prompt: string): Promise<string> {
        // Implementation
    }
}
```

## หมายเหตุ
- เอกสารนี้ควรอัพเดทเมื่อมีการเปลี่ยนแปลงฟังก์ชันการทำงาน
- หากพบข้อผิดพลาดหรือมีข้อเสนอแนะ กรุณาแจ้งให้ทราบ
- สามารถปรับแต่งการทำงานได้ตามความเหมาะสมของโปรเจค
