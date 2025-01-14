// salesReportController.js
const excelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require("fs");
const path = require("path");
const Order= require("../models/orderSchema");




exports.renderSalesReportPage = (req, res) => {
    try {
      // Render the EJS template for the Sales Report page
      res.render('salesreport', {
        title: 'Sales Report', // Pass a title for the page
        salesData: [], // Initially pass an empty array (no data loaded yet)
      });
    } catch (error) {
      console.error('Error rendering Sales Report page:', error);
      res.status(500).send('Error rendering Sales Report page');
    }
  };
  

// Function to fetch sales data based on filters
exports.getSalesReport = async (req, res) => {
  const { filter, startDate, endDate } = req.query;

  let matchCondition = {};
  if (filter === "today") {
    const today = new Date();
    matchCondition.createdAt = {
      $gte: new Date(today.setHours(0, 0, 0, 0)),
      $lt: new Date(today.setHours(23, 59, 59, 999)),
    };
  } else if (filter === "weekly") {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    matchCondition.createdAt = {
      $gte: weekStart,
      $lt: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000),
    };
  } else if (filter === "monthly") {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    matchCondition.createdAt = {
      $gte: monthStart,
      $lt: new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1),
    };
  } else if (filter === "yearly") {
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    matchCondition.createdAt = {
      $gte: yearStart,
      $lt: new Date(yearStart.getFullYear() + 1, 0, 1),
    };
  } else if (filter === "specific" && startDate && endDate) {
    matchCondition.createdAt = {
      $gte: new Date(startDate),
      $lt: new Date(endDate),
    };
  }

  try {
    const salesData = await Order.find(matchCondition).populate("userId").lean();

    res.json({ success: true, salesData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching sales data" });
  }
};


exports.downloadPdf = async (req, res) => {
    try {
      const salesData = req.body.salesData; // Parse sales data sent from the frontend
  
      // Create a new PDF document
      const pdfDoc = new PDFDocument();
  
      // Set the response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');
  
      // Pipe the PDF document to the response stream
      pdfDoc.pipe(res);
  
      // Add content to the PDF
      pdfDoc.fontSize(18).text('Sales Report', { align: 'center' });
      pdfDoc.moveDown();
  
      salesData.forEach((order) => {
        pdfDoc
          .fontSize(12)
          .text(`Order ID: ${order._id} | User: ${order.userId.name} | Total: ${order.totalAmount} | Status: ${order.status}`);
        pdfDoc.moveDown();
      });
  
      // Finalize the document
      pdfDoc.end();
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).send('Failed to generate PDF');
    }
  };

  exports.downloadExcel = async (req, res) => {
    try {
      const salesData = req.body.salesData; // Parse sales data sent from the frontend
  
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales Report');
  
      // Define worksheet columns
      worksheet.columns = [
        { header: 'Order ID', key: '_id', width: 30 },
        { header: 'User', key: 'user', width: 30 },
        { header: 'Total Amount', key: 'totalAmount', width: 15 },
        { header: 'Status', key: 'status', width: 20 },
      ];
  
      // Add rows to the worksheet
      salesData.forEach((data) => {
        worksheet.addRow({
          _id: data._id,
          user: data.userId.name,
          totalAmount: data.totalAmount,
          status: data.status,
        });
      });
  
      // Set the response headers
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');
  
      // Write the workbook to the response
      await workbook.xlsx.write(res);
      res.status(200).end();
    } catch (error) {
      console.error('Error generating Excel:', error);
      res.status(500).send('Failed to generate Excel');
    }
  };
