// ==UserScript==
// @name         BKalendar 2.0 - MyBK Schedule & Exam Exporter
// @namespace    https://bkalendar2.github.io/Bkalendar2.0/
// @version      2.3
// @description  Tự động nhận diện Thời khóa biểu & Lịch thi trên MyBK HCMUT để xuất file .ics và đồng bộ Google Calendar 1-Click
// @author       BKalendar 2.0 Team
// @match        *://mybk.hcmut.edu.vn/*
// @match        https://mybk.hcmut.edu.vn/*
// @match        https://mybk.hcmut.edu.vn/app/*
// @match        https://mybk.hcmut.edu.vn/app/he-thong-quan-ly/sinh-vien/*
// @match        https://mybk.hcmut.edu.vn/app/he-thong-quan-ly/sinh-vien/tkb*
// @match        https://mybk.hcmut.edu.vn/app/he-thong-quan-ly/sinh-vien/lich-thi*
// @match        *://tkb.hcmut.edu.vn/*
// @match        *://grad.hcmut.edu.vn/*
// @grant        GM_setClipboard
// @grant        window.onurlchange
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('[BKalendar 2.0] UserScript đã được nạp thành công trên trang:', window.location.href);

    const WEB_APP_URL = 'https://bkalendar2.github.io/Bkalendar2.0/';

    // Kiểm tra loại lịch dựa vào URL và nội dung trang
    function getScheduleType() {
        const url = (window.location.href || '').toLowerCase();
        const bodyText = (document.body ? document.body.innerText : '').toLowerCase();

        if (url.includes('lich-thi') || url.includes('lichthi') || bodyText.includes('lịch kiểm tra') || bodyText.includes('tổng số phút')) {
            return 'exam';
        }
        if (url.includes('tkb') || url.includes('thoi-khoa-bieu') || bodyText.includes('thời khóa biểu') || bodyText.includes('tuần học')) {
            return 'timetable';
        }
        return 'general';
    }

    // Tạo & hiển thị widget nổi ở góc màn hình
    function ensureFloatingWidget() {
        const parent = document.body || document.documentElement;
        if (!parent) return;

        let widget = document.getElementById('bkalendar-floating-widget');
        const schedType = getScheduleType();

        const isExam = schedType === 'exam';
        const isTT = schedType === 'timetable';

        const headerTitle = isExam ? '📅 Lịch Thi MyBK' : (isTT ? '📆 Thời Khóa Biểu MyBK' : '🎓 BKalendar 2.0');
        const badgeColor = isExam ? '#dc2626' : '#0284c7';

        if (!widget) {
            widget = document.createElement('div');
            widget.id = 'bkalendar-floating-widget';
            widget.style.cssText = `
                position: fixed !important;
                bottom: 25px !important;
                right: 25px !important;
                z-index: 2147483647 !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
                display: block !important;
            `;
            parent.appendChild(widget);
        }

        widget.innerHTML = `
            <div id="bk-card" style="
                background: #ffffff !important;
                border-radius: 16px !important;
                box-shadow: 0 10px 35px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.08) !important;
                padding: 12px 14px !important;
                min-width: 250px !important;
                max-width: 290px !important;
                color: #1e293b !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 8px !important;
            ">
                <div style="display: flex !important; align-items: center !important; justify-content: space-between !important; border-bottom: 1px solid #f1f5f9 !important; padding-bottom: 6px !important;">
                    <div style="font-size: 13px !important; font-weight: 700 !important; color: #0f172a !important; display: flex !important; align-items: center !important; gap: 5px !important;">
                        <span>${headerTitle}</span>
                    </div>
                    <span style="font-size: 10px !important; background: ${badgeColor} !important; color: #ffffff !important; padding: 2px 7px !important; border-radius: 10px !important; font-weight: 600 !important;">
                        ${isExam ? 'Lịch thi' : (isTT ? 'TKB' : 'HCMUT')}
                    </span>
                </div>

                <div style="display: flex !important; flex-direction: column !important; gap: 6px !important;">
                    <button id="bk-btn-sync-web" style="
                        background: linear-gradient(135deg, #0284c7, #2563eb) !important;
                        color: #ffffff !important;
                        border: none !important;
                        border-radius: 10px !important;
                        padding: 9px 12px !important;
                        font-size: 12px !important;
                        font-weight: 700 !important;
                        cursor: pointer !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        gap: 6px !important;
                        box-shadow: 0 2px 8px rgba(37,99,235,0.35) !important;
                    ">
                        <span>🚀 Đồng Bộ Lên Google Calendar</span>
                    </button>

                    <button id="bk-btn-export-ics" style="
                        background: #f8fafc !important;
                        color: #334155 !important;
                        border: 1px solid #cbd5e1 !important;
                        border-radius: 10px !important;
                        padding: 8px 12px !important;
                        font-size: 12px !important;
                        font-weight: 600 !important;
                        cursor: pointer !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        gap: 6px !important;
                    ">
                        <span>📥 Xuất File Lịch (.ics)</span>
                    </button>
                </div>
                
                <div style="text-align: center !important; font-size: 10px !important; color: #94a3b8 !important;">
                    BKalendar 2.0 • 1-Click Sync
                </div>
            </div>
        `;

        // Gán sự kiện click sau khi innerHTML được tạo
        const btnSyncWeb = widget.querySelector('#bk-btn-sync-web');
        const btnExportIcs = widget.querySelector('#bk-btn-export-ics');

        if (btnSyncWeb) {
            btnSyncWeb.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleOpenWebSync();
            };
        }

        if (btnExportIcs) {
            btnExportIcs.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleExportICS();
            };
        }
    }

    // ==========================================
    // LẤY DỮ LIỆU LỊCH TỪ TRANG
    // ==========================================
    function getScheduleRawText() {
        // 1. Quét qua các table xem table nào chứa thông tin lịch
        const tables = Array.from(document.querySelectorAll('table'));
        for (const tbl of tables) {
            const txt = (tbl.innerText || '').toLowerCase();
            if (txt.includes('môn học') || txt.includes('mã mh') || txt.includes('ngày thi') || txt.includes('tuần học') || txt.includes('phòng')) {
                const rows = Array.from(tbl.querySelectorAll('tr'));
                if (rows.length > 1) {
                    return rows.map(r => {
                        const cells = Array.from(r.querySelectorAll('th, td')).map(c => (c.innerText || '').trim());
                        return cells.join('\t');
                    }).join('\n');
                }
            }
        }

        // 2. Fallback: Lấy toàn bộ text của body
        return document.body ? document.body.innerText : '';
    }

    // ==========================================
    // ĐỒNG BỘ SANG WEB BKalendar 2.0
    // ==========================================
    function handleOpenWebSync() {
        const rawText = getScheduleRawText();
        if (!rawText || rawText.trim().length < 20) {
            alert('Không tìm thấy dữ liệu lịch trên trang! Vui lòng đảm bảo bảng Thời khóa biểu hoặc Lịch thi đã hiển thị đầy đủ rồi thử lại.');
            return;
        }

        // Copy vào Clipboard
        try {
            navigator.clipboard.writeText(rawText);
        } catch (err) {
            console.warn('Clipboard write warning:', err);
        }

        // Mở web app BKalendar 2.0 kèm dữ liệu trong URL Hash để web tự động điền và phân tích ngay lập tức
        const encoded = encodeURIComponent(rawText);
        window.open(`${WEB_APP_URL}#data=${encoded}`, '_blank');
    }

    // ==========================================
    // XUẤT FILE .ICS
    // ==========================================
    function handleExportICS() {
        const schedType = getScheduleType();
        const rawText = getScheduleRawText();

        if (schedType === 'exam' || rawText.includes('LỊCH KIỂM TRA') || rawText.includes('Tổng số phút') || rawText.includes('GK') || rawText.includes('CK')) {
            exportExamsICS(rawText);
        } else {
            exportTimetableICS(rawText);
        }
    }

    function exportExamsICS(rawText) {
        const exams = parseExams(rawText);
        if (!exams.length) {
            alert('Không tìm thấy môn thi nào! Vui lòng đợi bảng tải xong hoặc bấm "Đồng Bộ Lên Google Calendar" để kiểm tra.');
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

        exams.forEach((ex, idx) => {
            const dtStart = `${ex.date.replace(/-/g, '')}T${ex.startTime.replace(':', '')}00`;
            const dtEnd = `${ex.date.replace(/-/g, '')}T${ex.endTime.replace(':', '')}00`;
            icsLines.push(
                'BEGIN:VEVENT',
                `UID:mybk-exam-${ex.courseCode}-${ex.date}-${idx}@bkalendar2`,
                `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                `DTSTART;TZID=Asia/Ho_Chi_Minh:${dtStart}`,
                `DTEND;TZID=Asia/Ho_Chi_Minh:${dtEnd}`,
                `SUMMARY:${ex.courseName}`,
                `LOCATION:${ex.room}`,
                `DESCRIPTION:Môn thi: ${ex.courseName} (${ex.courseCode})\\nLoại thi: ${ex.examType}\\nPhòng: ${ex.room} - ${ex.campus}\\nNhóm lớp: ${ex.group}`,
                'STATUS:CONFIRMED',
                'BEGIN:VALARM',
                'TRIGGER:-P1D',
                'ACTION:DISPLAY',
                `DESCRIPTION:Nhắc trước 1 ngày: Thi ${ex.courseName}`,
                'END:VALARM',
                'BEGIN:VALARM',
                'TRIGGER:-PT2H',
                'ACTION:DISPLAY',
                `DESCRIPTION:Nhắc trước 2 giờ: Chuẩn bị thi ${ex.courseName}`,
                'END:VALARM',
                'END:VEVENT'
            );
        });

        icsLines.push('END:VCALENDAR');
        saveAsFile(icsLines.join('\r\n'), `Lich_Thi_MyBK_${exams[0].semester || 'HCMUT'}.ics`);
    }

    function parseExams(text) {
        const exams = [];
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const tokens = [];
        lines.forEach(line => {
            if (line.includes('\t')) tokens.push(...line.split('\t').map(t => t.trim()));
            else tokens.push(line);
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
                    const examType = examTypeCode.toUpperCase() === 'GK' ? 'Giữa kỳ' : (examTypeCode.toUpperCase() === 'CK' ? 'Cuối kỳ' : examTypeCode);
                    const campus = campusCode === 'BK-CS2' ? 'Cơ sở 2 (Dĩ An)' : 'Cơ sở 1 (Lý Thường Kiệt)';

                    const timeMatch = timeRaw.match(/(\d{1,2})[gG:](\d{2})/);
                    let sh = 7, sm = 0;
                    if (timeMatch) {
                        sh = parseInt(timeMatch[1], 10);
                        sm = parseInt(timeMatch[2], 10);
                    }
                    const startTime = `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
                    const dur = parseInt(durationStr, 10) || 60;
                    const totalEnd = sh * 60 + sm + dur;
                    const eh = Math.floor(totalEnd / 60);
                    const em = totalEnd % 60;
                    const endTime = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;

                    exams.push({ semester, courseCode, courseName, group, date, examType, campus, room, startTime, endTime, durationMinutes: dur });
                    ptr += 10;
                    continue;
                }
            }
            ptr++;
        }
        return exams;
    }

    function exportTimetableICS(rawText) {
        const list = parseTimetable(rawText);
        if (!list.length) {
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

        let anchorWeek = 0;
        let anchorMonday = null;
        const weekMatch = rawText.match(/Tuần:\s*(\d+)\s*,\s*Thứ\s*Hai\s*,\s*Ngày\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i);
        if (weekMatch) {
            anchorWeek = parseInt(weekMatch[1], 10);
            anchorMonday = `${weekMatch[4]}-${weekMatch[3].padStart(2, '0')}-${weekMatch[2].padStart(2, '0')}`;
        }

        function calcDate(anchorMon, anchorWk, targetWk, dayOfWeek) {
            const m = new Date(anchorMon);
            const diff = targetWk - anchorWk;
            m.setDate(m.getDate() + diff * 7 + (dayOfWeek - 2));
            return m.toISOString().split('T')[0];
        }

        list.forEach((item, idx) => {
            if (anchorWeek > 0 && anchorMonday && item.weekNumbers && item.weekNumbers.length > 0) {
                item.weekNumbers.forEach((wk, wIdx) => {
                    const cDate = calcDate(anchorMonday, anchorWeek, wk, item.dayOfWeek);
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
                    `UID:mybk-tt-rep-${item.courseCode}-${idx}@bkalendar2`,
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
        saveAsFile(icsLines.join('\r\n'), `Thoi_Khoa_Bieu_MyBK_${list[0].semester || 'HCMUT'}.ics`);
    }

    function parseTimetable(text) {
        const list = [];
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const tokens = [];
        lines.forEach(line => {
            if (line.includes('\t')) tokens.push(...line.split('\t').map(t => t.trim()));
            else tokens.push(line);
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

                    const campus = campusRaw === 'BK-CS2' ? 'Cơ sở 2 (Dĩ An)' : 'Cơ sở 1 (Lý Thường Kiệt)';
                    list.push({ semester, courseCode, courseName, group, dayOfWeek, periods, startTime, endTime, room, campus, weekNumbers });
                }
                ptr += 12;
                continue;
            }
            ptr++;
        }
        return list;
    }

    function saveAsFile(content, filename) {
        const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert(`✅ Đã xuất thành công file: ${filename}\nBạn có thể mở tệp này để nhập vào Google Calendar hoặc Lịch điện thoại.`);
    }

    // ==========================================
    // KHỞI CHẠY & LẮNG NGHE SỰ KIỆN SPA
    // ==========================================
    // 1. Lắng nghe urlchange từ Tampermonkey
    if (window.onurlchange === null) {
        window.addEventListener('urlchange', () => {
            setTimeout(ensureFloatingWidget, 600);
        });
    }

    // 2. Lắng nghe URL thay đổi qua history / hash
    let prevUrl = window.location.href;
    setInterval(() => {
        if (window.location.href !== prevUrl) {
            prevUrl = window.location.href;
            setTimeout(ensureFloatingWidget, 500);
        }
        // Luôn đảm bảo widget tồn tại trên DOM
        if (!document.getElementById('bkalendar-floating-widget')) {
            ensureFloatingWidget();
        }
    }, 1000);

    window.addEventListener('popstate', () => setTimeout(ensureFloatingWidget, 500));
    window.addEventListener('hashchange', () => setTimeout(ensureFloatingWidget, 500));
    document.addEventListener('DOMContentLoaded', () => setTimeout(ensureFloatingWidget, 500));
    window.addEventListener('load', () => setTimeout(ensureFloatingWidget, 800));
    setTimeout(ensureFloatingWidget, 1000);
})();
