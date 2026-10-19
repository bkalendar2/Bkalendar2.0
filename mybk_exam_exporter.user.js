// ==UserScript==
// @name         MyBK Schedule to Calendar (.ics) - BKalendar Plus
// @namespace    https://mybk.hcmut.edu.vn/
// @version      2.0
// @description  Tự động thêm nút xuất Thời khóa biểu & Lịch thi MyBK HCMUT sang Google Calendar và file .ics 1-Click
// @author       BK Student
// @match        https://mybk.hcmut.edu.vn/app/he-thong-quan-ly/sinh-vien/lich-thi*
// @match        https://mybk.hcmut.edu.vn/app/he-thong-quan-ly/sinh-vien/tkb*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const isExamPage = window.location.href.includes('lich-thi');

    function injectFloatingButton() {
        if (document.getElementById('bkalendar-action-btn')) return;

        const btnContainer = document.createElement('div');
        btnContainer.id = 'bkalendar-action-btn';
        btnContainer.style.position = 'fixed';
        btnContainer.style.bottom = '25px';
        btnContainer.style.right = '25px';
        btnContainer.style.zIndex = '99999';
        btnContainer.style.display = 'flex';
        btnContainer.style.flexDirection = 'column';
        btnContainer.style.gap = '10px';

        const exportBtn = document.createElement('button');
        exportBtn.innerHTML = isExamPage ? '📅 <strong>Xuất Lịch Thi (.ics)</strong>' : '📆 <strong>Xuất Thời Khóa Biểu (.ics)</strong>';
        exportBtn.style.padding = '12px 20px';
        exportBtn.style.backgroundColor = isExamPage ? '#003366' : '#0284c7';
        exportBtn.style.color = '#ffffff';
        exportBtn.style.border = 'none';
        exportBtn.style.borderRadius = '30px';
        exportBtn.style.cursor = 'pointer';
        exportBtn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        exportBtn.style.fontSize = '14px';
        exportBtn.style.fontWeight = 'bold';
        exportBtn.style.transition = 'transform 0.2s, background-color 0.2s';

        exportBtn.onmouseenter = () => { exportBtn.style.transform = 'scale(1.05)'; };
        exportBtn.onmouseleave = () => { exportBtn.style.transform = 'scale(1)'; };

        exportBtn.onclick = isExamPage ? extractAndDownloadExamICS : extractAndDownloadTimetableICS;

        btnContainer.appendChild(exportBtn);
        document.body.appendChild(btnContainer);
    }

    // ==========================================
    // Xuất Lịch Thi MyBK
    // ==========================================
    function extractAndDownloadExamICS() {
        const rows = document.querySelectorAll('table tbody tr');
        if (!rows || rows.length === 0) {
            alert('Không tìm thấy bảng lịch thi! Hãy đợi bảng tải xong.');
            return;
        }

        const exams = [];
        rows.forEach(row => {
            const cols = Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim());
            if (cols.length < 10) return;

            const semester = cols[0];
            const courseRaw = cols[1];
            const group = cols[2];
            const date = cols[3];
            const examTypeCode = cols[4];
            const campusCode = cols[5];
            const room = cols[6];
            const timeRaw = cols[8];
            const durationMinutes = parseInt(cols[9], 10) || 60;

            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                const parts = courseRaw.split(/\s*-\s*/);
                const courseCode = parts[0] || '';
                const courseName = parts.slice(1).join(' - ') || courseRaw;
                const examType = examTypeCode === 'GK' ? 'Giữa kỳ' : (examTypeCode === 'CK' ? 'Cuối kỳ' : examTypeCode);
                const campus = campusCode === 'BK-CS2' ? 'Cơ sở 2 (Dĩ An)' : 'Cơ sở 1 (Lý Thường Kiệt)';

                const timeMatch = timeRaw.match(/(\d{1,2})[gG:](\d{2})/);
                let startHour = 7, startMin = 0;
                if (timeMatch) {
                    startHour = parseInt(timeMatch[1], 10);
                    startMin = parseInt(timeMatch[2], 10);
                }
                const startTime = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;

                const totalEndMinutes = startHour * 60 + startMin + durationMinutes;
                const endHour = Math.floor(totalEndMinutes / 60);
                const endMin = totalEndMinutes % 60;
                const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

                exams.push({ semester, courseCode, courseName, group, date, examType, campus, room, startTime, endTime, durationMinutes });
            }
        });

        if (!exams.length) { alert('Không tìm thấy dữ liệu thi!'); return; }

        const icsLines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BKalendar Plus//MyBK Exam//VI', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
        exams.forEach((exam, idx) => {
            const dtStart = `${exam.date.replace(/-/g, '')}T${exam.startTime.replace(':', '')}00`;
            const dtEnd = `${exam.date.replace(/-/g, '')}T${exam.endTime.replace(':', '')}00`;
            icsLines.push(
                'BEGIN:VEVENT',
                `UID:mybk-exam-${exam.courseCode}-${exam.date}-${idx}@bkalendar`,
                `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                `DTSTART;TZID=Asia/Ho_Chi_Minh:${dtStart}`,
                `DTEND;TZID=Asia/Ho_Chi_Minh:${dtEnd}`,
                `SUMMARY:[Thi ${exam.examType}] ${exam.courseName}`,
                `LOCATION:${exam.room}`,
                `DESCRIPTION:Môn: ${exam.courseName} (${exam.courseCode})\\nPhòng: ${exam.room} - ${exam.campus}\\nNhóm: ${exam.group}`,
                'STATUS:CONFIRMED',
                'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:Ngày mai thi: ${exam.courseName}!`, 'END:VALARM',
                'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', `DESCRIPTION:Chuẩn bị thi: ${exam.courseName}!`, 'END:VALARM',
                'END:VEVENT'
            );
        });
        icsLines.push('END:VCALENDAR');

        downloadBlob(icsLines.join('\r\n'), `Lich_Thi_MyBK_${exams[0].semester}.ics`);
    }

    // ==========================================
    // Xuất Thời Khóa Biểu MyBK
    // ==========================================
    function extractAndDownloadTimetableICS() {
        const rows = document.querySelectorAll('table tbody tr');
        if (!rows || rows.length === 0) {
            alert('Không tìm thấy bảng thời khóa biểu! Hãy đợi bảng tải xong.');
            return;
        }

        // Tìm neo tuần học nếu có trên trang
        let anchorWeek = 0;
        let anchorMonday = null;
        const pageText = document.body.innerText;
        const matchAnchor = pageText.match(/Tuần:\s*(\d+)\s*,\s*Thứ\s*Hai\s*,\s*Ngày\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i);
        if (matchAnchor) {
            anchorWeek = parseInt(matchAnchor[1], 10);
            anchorMonday = `${matchAnchor[4]}-${matchAnchor[3].padStart(2, '0')}-${matchAnchor[2].padStart(2, '0')}`;
        }

        const items = [];
        rows.forEach(row => {
            const cols = Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim());
            if (cols.length < 12) return;

            const semester = cols[0];
            const courseCode = cols[1];
            const courseName = cols[2];
            const group = cols[5];
            const dayRaw = cols[6];
            const periods = cols[7];
            const timeRaw = cols[8];
            const room = cols[9];
            const campusRaw = cols[10];
            const weeksRaw = cols[11];

            if (/^[2-7]$/.test(dayRaw)) {
                const dayOfWeek = parseInt(dayRaw, 10);
                const campus = campusRaw === 'BK-CS2' ? 'Cơ sở 2 (Dĩ An)' : 'Cơ sở 1 (Lý Thường Kiệt)';
                
                let startTime = '07:00', endTime = '08:50';
                const tMatch = timeRaw.match(/(\d{1,2}):(\d{2})\s*[-_–]\s*(\d{1,2}):(\d{2})/);
                if (tMatch) {
                    startTime = `${tMatch[1].padStart(2, '0')}:${tMatch[2]}`;
                    endTime = `${tMatch[3].padStart(2, '0')}:${tMatch[4]}`;
                }

                const weekNumbers = [];
                if (weeksRaw.includes('|')) {
                    weeksRaw.split('|').forEach(w => {
                        const clean = w.trim();
                        if (/^\d+$/.test(clean)) weekNumbers.push(parseInt(clean, 10));
                    });
                }

                items.push({ semester, courseCode, courseName, group, dayOfWeek, periods, startTime, endTime, room, campus, weekNumbers });
            }
        });

        if (!items.length) { alert('Không tìm thấy môn học nào có lịch cụ thể để xuất!'); return; }

        const icsLines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BKalendar Plus//MyBK Timetable//VI', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Thời Khóa Biểu HCMUT'];

        function calcDate(anchorMon, anchorWk, targetWk, day) {
            const d = new Date(anchorMon);
            d.setDate(d.getDate() + (targetWk - anchorWk) * 7 + (day - 2));
            return d.toISOString().split('T')[0];
        }

        items.forEach((item, idx) => {
            if (anchorWeek > 0 && anchorMonday && item.weekNumbers.length > 0) {
                item.weekNumbers.forEach((wk, wIdx) => {
                    const cDate = calcDate(anchorMonday, anchorWeek, wk, item.dayOfWeek);
                    const dtStart = `${cDate.replace(/-/g, '')}T${item.startTime.replace(':', '')}00`;
                    const dtEnd = `${cDate.replace(/-/g, '')}T${item.endTime.replace(':', '')}00`;
                    icsLines.push(
                        'BEGIN:VEVENT',
                        `UID:mybk-tt-${item.courseCode}-w${wk}-${idx}-${wIdx}@bkalendar`,
                        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                        `DTSTART;TZID=Asia/Ho_Chi_Minh:${dtStart}`,
                        `DTEND;TZID=Asia/Ho_Chi_Minh:${dtEnd}`,
                        `SUMMARY:${item.courseName}`,
                        `LOCATION:${item.room}`,
                        `DESCRIPTION:Môn: ${item.courseName} (${item.courseCode})\\nTiết: ${item.periods}\\nPhòng: ${item.room} - ${item.campus}\\nTuần: ${wk}`,
                        'STATUS:CONFIRMED',
                        'BEGIN:VALARM', 'TRIGGER:-PT15M', 'ACTION:DISPLAY', `DESCRIPTION:Sắp tới giờ học: ${item.courseName}!`, 'END:VALARM',
                        'END:VEVENT'
                    );
                });
            }
        });
        icsLines.push('END:VCALENDAR');

        downloadBlob(icsLines.join('\r\n'), `Thoi_Khoa_Bieu_HCMUT_${items[0].semester}.ics`);
    }

    function downloadBlob(content, filename) {
        const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert(`✅ Đã xuất thành công file ${filename}!\nBạn có thể mở file này để thêm ngay vào Google Calendar hoặc Lịch điện thoại.`);
    }

    window.addEventListener('load', () => setTimeout(injectFloatingButton, 1000));
    setInterval(injectFloatingButton, 2000);
})();
