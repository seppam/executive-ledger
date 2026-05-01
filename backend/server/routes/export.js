/**
 * server/routes/export.js
 * GET /api/export/csv     — download transactions as CSV
 * GET /api/export/pdf     — generate and download monthly PDF report
 * POST /api/export/send-email — send PDF report via email
 */
import express from 'express';
import PDFDocument from 'pdfkit';
import { authenticate } from '../middleware/auth.js';
import prisma from '../../lib/prisma.js';

const router = express.Router();
router.use(authenticate);

const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

// ── GET /api/export/csv ───────────────────────────────────────────────────────
router.get('/csv', async (req, res) => {
  try {
    const { from, to, type } = req.query;
    const where = { userId: req.user.id };
    if (type && ['income','expense'].includes(type)) where.type = type;
    if (from || to) { where.date = {}; if (from) where.date.gte = from; if (to) where.date.lte = to; }

    const expenses = await prisma.expense.findMany({ where, orderBy: { date: 'asc' } });

    const rows = [['Date','Type','Category','Description','Amount']];
    expenses.forEach((e) => {
      rows.push([e.date, e.type, e.category, `"${e.description}"`, e.amount.toFixed(2)]);
    });

    const total = expenses.reduce((s, e) => s + (e.type === 'expense' ? -1 : 1) * Number(e.amount), 0);
    rows.push([]);
    rows.push(['','','','Net', total.toFixed(2)]);

    const csv  = rows.map((r) => r.join(',')).join('\n');
    const filename = `transactions_${from || 'start'}_${to || 'end'}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  } catch (err) {
    console.error('[GET /api/export/csv]', err);
    return res.status(500).json({ message: 'Failed to export CSV.' });
  }
});

// ── GET /api/export/pdf ───────────────────────────────────────────────────────
router.get('/pdf', async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = month ? parseInt(month) : new Date().getMonth() + 1;
    const y = year  || String(new Date().getFullYear());
    const startDate = `${y}-${String(m).padStart(2,'0')}-01`;
    const endDate   = `${y}-${String(m).padStart(2,'0')}-31`;

    const expenses = await prisma.expense.findMany({
      where: { userId: req.user.id, date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' },
    });

    const totalIncome  = expenses.filter((e) => e.type === 'income').reduce((s, e) => s + Number(e.amount), 0);
    const totalExpense = expenses.filter((e) => e.type === 'expense').reduce((s, e) => s + Number(e.amount), 0);

    const byCategory = {};
    expenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount);
    });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report_${MONTH_NAMES[m-1]}_${y}.pdf"`);
    doc.pipe(res);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('Executive Ledger', { align: 'center' });
    doc.fontSize(14).font('Helvetica').text(`Monthly Report — ${MONTH_NAMES[m-1]} ${y}`, { align: 'center' });
    doc.moveDown(1.5);

    // Summary box
    const net = totalIncome - totalExpense;
    doc.rect(50, doc.y, 512, 70).stroke('#e0e0e0');
    const boxY = doc.y + 10;
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total Income:  $${totalIncome.toFixed(2)}`, 70, boxY);
    doc.text(`Total Expense: $(${totalExpense.toFixed(2)})`, 70, boxY + 18);
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`Net Balance:   $${net.toFixed(2)}`, 70, boxY + 36);

    doc.moveDown(2);

    // Category breakdown
    doc.font('Helvetica-Bold').fontSize(14).text('Spending by Category', { underline: true });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10);
    Object.entries(byCategory).sort(([,a],[,b]) => b-a).forEach(([cat, amt]) => {
      doc.text(`  • ${cat}:  $${amt.toFixed(2)}`);
    });

    doc.moveDown(1.5);

    // Transaction table
    doc.font('Helvetica-Bold').fontSize(14).text('Transactions', { underline: true });
    doc.moveDown(0.5);

    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const colW    = [80, 220, 110, 60, 82];
    let yPos      = doc.y;

    doc.rect(50, yPos, 512, 20).fill('#f0f0f0');
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#333');
    headers.forEach((h, i) => doc.text(h, 50 + (i === 0 ? 5 : 50 + colW.slice(0,i).reduce((a,b) => a+b,0)), yPos + 5, { width: colW[i] }));
    yPos += 22;

    doc.font('Helvetica').fontSize(9).fillColor('#333');
    expenses.slice(0, 80).forEach((e, idx) => {
      if (idx % 2 === 0) {
        doc.rect(50, yPos - 3, 512, 18).fill('#fafafa');
      }
      const row = [
        e.date, e.description.substring(0,30), e.category, e.type,
        `${e.type === 'expense' ? '-' : '+'}$${Number(e.amount).toFixed(2)}`,
      ];
      row.forEach((cell, i) => {
        const x = 50 + (i === 0 ? 5 : 50 + colW.slice(0,i).reduce((a,b) => a+b,0));
        doc.text(String(cell), x, yPos, { width: colW[i] });
      });
      yPos += 18;
      if (yPos > 750) { doc.addPage(); yPos = 50; }
    });

    // Footer
    doc.fontSize(8).fillColor('#999').text(
      `Generated by Executive Ledger on ${new Date().toLocaleDateString()}`,
      50, 780, { align: 'center' }
    );

    doc.end();
  } catch (err) {
    console.error('[GET /api/export/pdf]', err);
    return res.status(500).json({ message: 'Failed to generate PDF.' });
  }
});

// ── POST /api/export/send-email ───────────────────────────────────────────────
router.post('/send-email', async (req, res) => {
  try {
    const { toEmail, month, year } = req.body;
    if (!toEmail) return res.status(400).json({ message: 'toEmail is required.' });

    const nodemailer = (await import('nodemailer')).default;
    const { emailHost, emailPort, emailUser, emailPass } = process.env;

    if (!emailHost || !emailUser || !emailPass) {
      return res.status(400).json({
        code: 'EMAIL_NOT_CONFIGURED',
        message: 'Email is not configured. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS in backend/.env. See Settings → Email Setup for instructions.',
      });
    }

    const m = month ? parseInt(month) : new Date().getMonth() + 1;
    const y = year  || String(new Date().getFullYear());
    const monthName = MONTH_NAMES[m - 1];

    const transporter = nodemailer.createTransport({
      host:   emailHost,
      port:   parseInt(emailPort) || 587,
      secure: parseInt(emailPort) === 465,
      auth:   { user: emailUser, pass: emailPass },
    });

    await transporter.sendMail({
      from:    `"Executive Ledger" <${emailUser}>`,
      to:      toEmail,
      subject: `Monthly Report — ${monthName} ${y}`,
      text:    `Hi,\n\nPlease find your Executive Ledger monthly report for ${monthName} ${y} attached.\n\nRegards,\nExecutive Ledger`,
      attachments: [{
        filename: `report_${monthName}_${y}.pdf`,
        path:     `${process.env.EXPORT_DIR || '/tmp'}/report_${y}_${m}.pdf`,
      }],
    });

    return res.status(200).json({ message: 'Email sent successfully.' });
  } catch (err) {
    console.error('[POST /api/export/send-email]', err);
    return res.status(500).json({ message: err.message || 'Failed to send email.' });
  }
});

export default router;
