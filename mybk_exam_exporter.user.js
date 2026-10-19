// ==UserScript==
// @name         BKalendar 2.0 - MyBK Schedule & Exam Exporter
// @namespace    https://bkalendar2.github.io/Bkalendar2.0/
// @version      2.1
// @description  Tự động nhận diện Thời khóa biểu & Lịch thi trên MyBK HCMUT để xuất file .ics và đồng bộ Google Calendar 1-Click
// @author       BKalendar 2.0 Team
// @match        *://mybk.hcmut.edu.vn/*
// @match        *://*.hcmut.edu.vn/*
// @grant        GM_setClipboard
// @grant        window.onurlchange
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const WEB_APP_URL = 'https://bkalendar2.github.io/Bkalendar2.0/';

    // Xác định loại trang hiện tại (chạy lại mỗi khi SPA chuyển trang)
    function detectPageType() {
        const url = window.location.href.toLowerCase();
        const text = (document.body ? document.body.innerText : '').toLowerCase();

        // Kiểm tra Lịch thi
        if (url.includes('lich-thi') || url.includes('lichthi') || text.includes('lịch kiểm tra') || text.includes('tổng số phút')) {
            return 'exam';
        }

        // Kiểm tra Thời khóa biểu
        if (url.includes('tkb') || url.includes('thoi-khoa-bieu') || url.includes('thoikhoabieu') || text.includes('tuần học') || text.includes('thời khóa biểu')) {
            return 'timetable';
        }

        return 'unknown';
    }

    // Tạo & nhúng Floating Widget vào trang
    function injectFloatingWidget() {
        const pageType = detectPageType();
        let widget = document.getElementById('bkalendar-floating-widget');

        // Nếu ở các trang không liên quan đến lịch thì ẩn đi
        if (pageType === 'unknown') {
            if (widget) widget.style.display = 'none';
            return;
        }

        if (!widget) {
            widget = document.createElement('div');
            widget.id = 'bkalendar-floating-widget';
            widget.style.position = 'fixed';
            widget.style.bottom = '25px';
            widget.style.right = '25px';
            widget.style.zIndex = '999999';
            widget.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
            document.body.appendChild(widget);
        }

        widget.style.display = 'block';

        const isExam = pageType === 'exam';
        const titleText = isExam ? '📅 Xuất Lịch Thi MyBK' : '📆 Xuất Thời Khóa Biểu';
        const accentColor = isExam ? '#003366' : '#0284c7';

        widget.innerHTML = `
            <div id="bkalendar-card" style="background: #ffffff; border-radius: 18px; box-shadow: 0 8px 30px rgba(0,0,0,0.25); border: 1px solid #e2e8f0; padding: 12px 14px; min-width: 250px; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; items-center; justify-content: space-between; gap: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
                    <div style="font-size: 13px; font-weight: bold; color: ${accentColor}; display: flex; align-items: center; gap: 6px;">
                        <span>${titleText}</span>
                    </div>
                    <span style="font-size: 10px; background: #e0f2fe; color: #0369a1; padding: 2px 7px; border-radius: 12px; font-weight: 600;">BKalendar 2.0</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <button id="bk-btn-sync-gcal" style="background: linear-gradient(135deg, #0284c7, #2563eb); color: #ffffff; border: none; border-radius: 10px; padding: 9px 12px; font-size: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 8px rgba(37,99,235,0.3); transition: all 0.2s;">
                        <span>🚀 Đồng Bộ Trực Tiếp Google Calendar</span>
                    </button>
                    <button id="bk-btn-export-ics" style="background: #f8fafc; color: #334155; border: 1px solid #cbd5e1; border-radius: 10px; padding: 8px 12px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
                        <span>📥 Tải File Lịch (.ics)</span>
                    </button>
                </div>
            </div>
        `;

        // Gán sự kiện click
        document.getElementById('bk-btn-export-ics').onclick = () => {
            if (isExam) {
                exportExamsToICS();
            } else {
                exportTimetableToICS();
            }
        };

        document.getElementById('bk-btn-sync-gcal').onclick = () => {
            openWebSync(isExam);
        };
    }

    // ==========================================
    // Chuyển dữ liệu sang Web App BKalendar 2.0
    // ==========================================
    function openWebSync(isExam) {
        const textData = getPageRawScheduleText(isExam);
        if (!textData) {
            alert('Không tìm thấy dữ liệu trên trang! Vui lòng đảm bảo bảng đã tải xong.');
            return;
        }

        // Copy vào clipboard cho người dùng
        try {
            navigator.clipboard.writeText(textData);
        } catch (e) {
            console.warn('Clipboard write failed, using fallback');
        }

        // Mở web app với dữ liệu mã hóa trong Hash
        const encoded = encodeURIComponent(textData);
        window.open(`${WEB_APP_URL}#data=${encoded}`, '_blank');
    }

    // Trích xuất toàn bộ văn bản lịch từ DOM
    function getPageRawScheduleText(isExam) {
        // Cách 1: Lấy từ table
        const table = document.querySelector('table');
        if (table) {
            const rows = Array.from(table.querySelectorAll('tr'));
            if (rows.length > 1) {
                return rows.map(r => {
                    const cells = Array.from(r.querySelectorAll('th, td')).map(c => c.innerText.trim());
                    return cells.join('\t');
                }).join('\n');
            }
        }
        // Cách 2: Lấy body text
        return document.body ? document.body.innerText : '';
    }

    // ==========================================
    // Bóc tách & Xuất Lịch Thi (.ics)
    // ==========================================
    function exportExamsToICS() {
        const rawText = getPageRawScheduleText(true);
        const exams = parseExamsFromText(rawText);

        if (!exams || exams.length === 0) {
            alert('Không tìm thấy môn thi nào trên trang! Vui lòng chờ bảng lịch thi hiển thị đầy đủ rồi thử lại.');
            return;
        }

        const icsLines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//BKalendar 2.0//MyBK Exam Exporter//VI',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            `X-WR-CALNAME:Lịch Thi BK - HK ${exams[0].semester || 'HCMUT'}`
        ];

        exams.forEach((exam, idx) => {
            const dtStart = `${exam.date.replace(/-/g, '')}T${exam.startTime.replace(':', '')}00`;
            const dtEnd = `${exam.date.replace(/-/g, '')}T${exam.endTime.replace(':', '')}00`;
            icsLines.push(
                'BEGIN:VEVENT',
                `UID:mybk-exam-${exam.courseCode}-${exam.date}-${idx}@bkalendar2`,
                `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                `DTSTART;TZID=Asia/Ho_Chi_Minh:${dtStart}`,
                `DTEND;TZID=Asia/Ho_Chi_Minh:${dtEnd}`,
                `SUMMARY:${exam.courseName}`,
                `LOCATION:${exam.room}`,
                `DESCRIPTION:Môn thi: ${exam.courseName} (${exam.courseCode})\\nLoại thi: ${exam.examType}\\nPhòng: ${exam.room} - ${exam.campus}\\nNhóm lớp: ${exam.group}`,
                'STATUS:CONFIRMED',
                'BEGIN:VALARM',
                'TRIGGER:-P1D',
                'ACTION:DISPLAY',
                `DESCRIPTION:Nhắc trước 1 ngày: Thi ${exam.courseName}`,
                'END:VALARM',
                'BEGIN:VALARM',
                'TRIGGER:-PT2H',
                'ACTION:DISPLAY',
                `DESCRIPTION:Nhắc trước 2 giờ: Chuẩn bị thi ${exam.courseName}`,
                'END:VALARM',
                'END:VEVENT'
            );
        });

        icsLines.push('END:VCALENDAR');
        downloadFile(icsLines.join('\r\n'), `Lich_Thi_MyBK_${exams[0].semester || 'HCMUT'}.ics`);
    }

    function parseExamsFromText(text) {
        const exams = [];
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

        const tokens = [];
        lines.forEach(line => {
            if (line.includes('\t')) {
                tokens.push(...line.split('\t').map(t => t.trim()));
            } else {
                tokens.push(line);
            }
        });

        let ptr = 0;
        while (ptr < tokens.length) {
            const tok = tokens[ptr];
            if (/^\d{5}$/.test(tok) && ptr + 9 < tokens.length) {
                const semester = tok;
                const courseRaw = tokens[ptr + 1];
                const group = tokens[ptr + 2];
                const date = tokens[ptr + 3];
                const examTypeCode = tokens[ptr + 4];
                const campusCode = tokens[ptr + 5];
                const room = tokens[ptr + 6];
                const timeRaw = tokens[ptr + 8];
                const durationStr = tokens[ptr + 9];

                if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                    const parts = courseRaw.split(/\s*-\s*/);
                    const courseCode = parts[0]?.trim() || '';
                    const courseName = parts.slice(1).join(' - ').trim() || courseRaw;

                    const examType = examTypeCode.toUpperCase() === 'GK' ? 'Giữa kỳ' : 
                                     examTypeCode.toUpperCase() === 'CK' ? 'Cuối kỳ' : examTypeCode;
                    const campus = campusCode === 'BK-CS2' ? 'Cơ sở 2 (Dĩ An)' : 'Cơ sở 1 (Lý Thường Kiệt)';

                    const timeMatch = timeRaw.match(/(\d{1,2})[gG:](\d{2})/);
                    let startH = 7, startM = 0;
                    if (timeMatch) {
                        startH = parseInt(timeMatch[1], 10);
                        startM = parseInt(timeMatch[2], 10);
                    }
                    const startTime = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
                    const duration = parseInt(durationStr, 10) || 60;
                    const totalEnd = startH * 60 + startM + duration;
                    const endH = Math.floor(totalEnd / 60);
                    const endM = totalEnd % 60;
                    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

                    exams.push({ semester, courseCode, courseName, group, date, examType, campus, room, startTime, endTime, duration });
                    ptr += 10;
                    continue;
                }
            }
            ptr++;
        }
        return exams;
    }

    // ==========================================
    // Bóc tách & Xuất Thời Khóa Biểu (.ics)
    // ==========================================
    function exportTimetableToICS() {
        const rawText = getPageRawScheduleText(false);
        const list = parseTimetableFromText(rawText);

        if (!list || list.length === 0) {
            alert('Không tìm thấy môn học nào có thời khóa biểu cố định để xuất!');
            return;
        }

        const icsLines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//BKalendar 2.0//MyBK Timetable Exporter//VI',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            `X-WR-CALNAME:Thời Khóa Biểu BK - HK ${list[0].semester || 'HCMUT'}`
        ];

        // Lấy thông tin neo tuần nếu có
        let anchorWeek = 0;
        let anchorMonday = null;
        const weekMatch = rawText.match(/Tuần:\s*(\d+)\s*,\s*Thứ\s*Hai\s*,\s*Ngày\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i);
        if (weekMatch) {
            anchorWeek = parseInt(weekMatch[1], 10);
            anchorMonday = `${weekMatch[4]}-${weekMatch[3].padStart(2, '0')}-${weekMatch[2].padStart(2, '0')}`;
        }

        function calculateClassDate(anchorMon, anchorWk, targetWk, dayOfWeek) {
            const m = new Date(anchorMon);
            const diff = targetWk - anchorWk;
            m.setDate(m.getDate() + diff * 7 + (dayOfWeek - 2));
            return m.toISOString().split('T')[0];
        }

        list.forEach((item, idx) => {
            if (anchorWeek > 0 && anchorMonday && item.weekNumbers && item.weekNumbers.length > 0) {
                // Tạo từng buổi học theo lịch tuần chính xác
                item.weekNumbers.forEach((wk, wIdx) => {
                    const cDate = calculateClassDate(anchorMonday, anchorWeek, wk, item.dayOfWeek);
                    const dtStart = `${cDate.replace(/-/g, '')}T${item.startTime.replace(':', '')}00`;
                    const dtEnd = `${cDate.replace(/-/g, '')}T${item.endTime.replace(':', '')}00`;
                    icsLines.push(
                        'BEGIN:VEVENT',
                        `UID:mybk-tt-${item.courseCode}-w${wk}-${idx}-${wIdx}@bkalendar2`,
                        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                        `DTSTART;TZID=Asia/Ho_Chi_Minh:${dtStart}`,
                        `DTEND;TZID=Asia/Ho_Chi_Minh:${dtEnd}`,
                        `SUMMARY:${item.courseName}`,
                        `LOCATION:${item.room}`,
                        `DESCRIPTION:Môn học: ${item.courseName} (${item.courseCode})\\nTiết: ${item.periods} (${item.startTime} - ${item.endTime})\\nPhòng: ${item.room} - ${item.campus}\\nTuần học: ${wk}`,
                        'STATUS:CONFIRMED',
                        'BEGIN:VALARM',
                        'TRIGGER:-PT15M',
                        'ACTION:DISPLAY',
                        `DESCRIPTION:Sắp tới giờ học: ${item.courseName}`,
                        'END:VALARM',
                        'END:VEVENT'
                    );
                });
            } else {
                // Fallback lặp lại hàng tuần (15 tuần)
                const now = new Date();
                const curDay = now.getDay() === 0 ? 8 : now.getDay() + 1;
                let diff = item.dayOfWeek - curDay;
                if (diff < 0) diff += 7;
                const startObj = new Date(now);
                startObj.setDate(now.getDate() + diff);
                const startDate = startObj.toISOString().split('T')[0];
                const dtStart = `${startDate.replace(/-/g, '')}T${item.startTime.replace(':', '')}00`;
                const dtEnd = `${startDate.replace(/-/g, '')}T${item.endTime.replace(':', '')}00`;

                icsLines.push(
                    'BEGIN:VEVENT',
                    `UID:mybk-tt-repeat-${item.courseCode}-${idx}@bkalendar2`,
                    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                    `DTSTART;TZID=Asia/Ho_Chi_Minh:${dtStart}`,
                    `DTEND;TZID=Asia/Ho_Chi_Minh:${dtEnd}`,
                    'RRULE:FREQ=WEEKLY;COUNT=16',
                    `SUMMARY:${item.courseName}`,
                    `LOCATION:${item.room}`,
                    `DESCRIPTION:Môn học: ${item.courseName} (${item.courseCode})\\nTiết: ${item.periods}\\nPhòng: ${item.room} - ${item.campus}`,
                    'STATUS:CONFIRMED',
                    'BEGIN:VALARM',
                    'TRIGGER:-PT15M',
                    'ACTION:DISPLAY',
                    `DESCRIPTION:Sắp tới giờ học: ${item.courseName}`,
                    'END:VALARM',
                    'END:VEVENT'
                );
            }
        });

        icsLines.push('END:VCALENDAR');
        downloadFile(icsLines.join('\r\n'), `Thoi_Khoa_Bieu_MyBK_${list[0].semester || 'HCMUT'}.ics`);
    }

    function parseTimetableFromText(text) {
        const list = [];
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

        const tokens = [];
        lines.forEach(line => {
            if (line.includes('\t')) {
                tokens.push(...line.split('\t').map(t => t.trim()));
            } else {
                tokens.push(line);
            }
        });

        let ptr = 0;
        while (ptr < tokens.length) {
            const token = tokens[ptr];
            if (/^\d{5}$/.test(token) && ptr + 11 < tokens.length && /^[A-Z]{2}\d{4}$/.test(tokens[ptr + 1])) {
                const semester = token;
                const courseCode = tokens[ptr + 1];
                const courseName = tokens[ptr + 2];
                const group = tokens[ptr + 5];
                const dayRaw = tokens[ptr + 6];
                const periods = tokens[ptr + 7];
                const timeRaw = tokens[ptr + 8];
                const room = tokens[ptr + 9];
                const campusRaw = tokens[ptr + 10];
                const weeksRaw = tokens[ptr + 11];

                let dayOfWeek = 0;
                if (/^[2-7]$/.test(dayRaw)) dayOfWeek = parseInt(dayRaw, 10);
                else if (dayRaw === 'CN' || dayRaw === '8') dayOfWeek = 8;

                if (dayOfWeek > 0) {
                    let startTime = '07:00', endTime = '08:50';
                    const tMatch = timeRaw.match(/(\d{1,2}):(\d{2})\s*[-_–]\s*(\d{1,2}):(\d{2})/);
                    if (tMatch) {
                        startTime = `${tMatch[1].padStart(2, '0')}:${tMatch[2]}`;
                        endTime = `${tMatch[3].padStart(2, '0')}:${tMatch[4]}`;
                    }

                    const weekNumbers = [];
                    if (weeksRaw.includes('|')) {
                        weeksRaw.split('|').forEach(w => {
                            if (/^\d+$/.test(w.trim())) weekNumbers.push(parseInt(w.trim(), 10));
                        });
                    }

                    const campus = campusCode(campusRaw);
                    list.push({ semester, courseCode, courseName, group, dayOfWeek, periods, startTime, endTime, room, campus, weekNumbers });
                }
                ptr += 12;
                continue;
            }
            ptr++;
        }
        return list;
    }

    function campusCode(raw) {
        if (!raw) return 'HCMUT';
        if (raw.includes('CS2') || raw.includes('Dĩ An')) return 'Cơ sở 2 (Dĩ An)';
        if (raw.includes('CS1') || raw.includes('Lý Thường Kiệt')) return 'Cơ sở 1 (Lý Thường Kiệt)';
        return raw;
    }

    function downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert(`✅ Đã xuất thành công file ${filename}!\nBạn có thể mở tệp này để nhập vào Google Calendar hoặc Lịch điện thoại.`);
    }

    // Lắng nghe thay đổi URL (SPA router) & khởi chạy
    if (window.onurlchange === null) {
        window.addEventListener('urlchange', () => {
            setTimeout(injectFloatingWidget, 500);
        });
    }

    let lastUrl = window.location.href;
    setInterval(() => {
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            setTimeout(injectFloatingWidget, 500);
        }
    }, 600);

    window.addEventListener('popstate', () => setTimeout(injectFloatingWidget, 500));
    window.addEventListener('hashchange', () => setTimeout(injectFloatingWidget, 500));
    window.addEventListener('load', () => setTimeout(injectFloatingWidget, 800));
    document.addEventListener('DOMContentLoaded', () => setTimeout(injectFloatingWidget, 500));
    setTimeout(injectFloatingWidget, 1000);
})();
