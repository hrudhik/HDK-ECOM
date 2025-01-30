// salesReportController.js
const excelJS = require('exceljs');
const PDFDocument = require('pdfkit');
// const fs = require("fs");
// const path = require("path");
const Order= require("../models/orderSchema");
const pdfTable = require('pdfkit-table');


const renderSalesReportPage =  async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);

    const orders = await Order.find({})
      .populate("userId")
      .skip(skip)
      .limit(limit)
      .lean();

    const totalRevenue = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    res.render("salesreport", {
      orders,
      totalOrders,
      totalRevenue: totalRevenue[0]?.totalRevenue || 0,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error("Error rendering sales report page:", error);
    res.status(500).send("Error rendering sales report page");
  }
};


// Function to fetch sales data with pagination
const getSalesReport = async (req, res) => {
  try {
    const { filter, startDate, endDate, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

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

    const totalOrders = await Order.countDocuments(matchCondition);
    const totalPages = Math.ceil(totalOrders / limit);

    const orders = await Order.find(matchCondition)
      .populate("userId")
      .skip(skip)
      .limit(limit)
      .lean();

    const totalRevenue = await Order.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    res.render("salesreport", {
      orders,
      totalOrders,
      totalRevenue: totalRevenue[0]?.totalRevenue || 0,
      currentPage: parseInt(page),
      totalPages,
      filter,
    });
  } catch (error) {
    console.error("Error filtering sales report:", error);
    res.status(500).send("Error filtering sales report");
  }
};
const downloadPdf = async (req, res) => {
  try {
    const { filter, startDate, endDate } = req.query;
    let matchCondition = {};

    if (filter === "today") {
      const today = new Date();
      matchCondition.createdAt = {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999)),
      };
    } else if (filter === "specific" && startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lt: new Date(endDate),
      };
    }

    const salesData = await Order.find(matchCondition).populate("userId").lean();

    const pdfDoc = new PDFDocument({ margin: 30 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=sales_report.pdf");
    pdfDoc.pipe(res);

    // Title
    pdfDoc.fontSize(18).text("Sales Report", { align: "center" }).moveDown(1);

    // Table Headers
    const tableTop = 100;
    let y = tableTop;

    const columnWidths = [150, 200, 150, 100]; // Adjust column widths
    const headers = ["Order ID", "User Name", "Total Amount", "Status"];

    pdfDoc.fontSize(12).font("Helvetica-Bold");
    let x = 50;

    headers.forEach((header, i) => {
      pdfDoc.text(header, x, y, { width: columnWidths[i], align: "left" });
      x += columnWidths[i];
    });

    // Draw a line under headers
    y += 20;
    pdfDoc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;

    // Table Content
    pdfDoc.fontSize(10).font("Helvetica");

    salesData.forEach((order, index) => {
      x = 50;

      const rowData = [
        order._id,
        order.userId.name || "N/A",
        `₹${order.totalAmount.toLocaleString("en-IN")}`,
        order.status,
      ];

      rowData.forEach((data, i) => {
        pdfDoc.text(data, x, y, { width: columnWidths[i], align: "left" });
        x += columnWidths[i];
      });

      y += 20;

      // Check for page overflow
      if (y > 750) {
        pdfDoc.addPage();
        y = tableTop; // Reset y position
      }
    });

    // Finalize the PDF
    pdfDoc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Failed to generate PDF");
  }
};


// try {
//   const salesData = req.body.salesData; 
  
//   const pdfDoc = new PDFDocument({ margin: 30 });

  
//   res.setHeader('Content-Type', 'application/pdf');
//   res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');

  
//   pdfDoc.pipe(res);

  
//   pdfDoc.fontSize(18).text('Sales Report', { align: 'center' }).moveDown();

  
//   const tableTop = 100;
//   const cellPadding = 5;
//   const columnWidths = [150, 100, 100, 100]; 
  
//   const headers = ['Order ID', 'User Name', 'Total Amount', 'Status'];
//   let x = 50; 

//   pdfDoc.fontSize(12).font('Helvetica-Bold');

//   headers.forEach((header, index) => {
//     pdfDoc
//       .rect(x, y, columnWidths[index], 20) 
//       .stroke()
//       .text(header, x + cellPadding, y + cellPadding, { width: columnWidths[index] - cellPadding });
//     x += columnWidths[index]; 
//   });

 
//   y += 20; 
//   pdfDoc.fontSize(10).font('Helvetica');
//   salesData.forEach((order) => {
//     x = 50;
//     const rowData = [
//       order._id,
//       order.userId.name,
//       `${order.totalAmount.toLocaleString('en-IN')}`,
//       order.status,
//     ];

//     rowData.forEach((data, index) => {
//       pdfDoc
//         .rect(x, y, columnWidths[index], 20) 
//         .stroke()
//         .text(data, x + cellPadding, y + cellPadding, { width: columnWidths[index] - cellPadding });
//       x += columnWidths[index];
//     });
//     y += 20; 
//   });

//   // Finalize the document
//   pdfDoc.end();
// } catch (error) {
//   console.error('Error generating PDF:', error);
//   res.status(500).send('Failed to generate PDF');
// }
// };


// Download Excel
const downloadExcel = async (req, res) => {
  try {
    const { filter, startDate, endDate } = req.query;
    let matchCondition = {};

    if (filter === "specific" && startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lt: new Date(endDate),
      };
    }

    const salesData = await Order.find(matchCondition).populate("userId").lean();

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    worksheet.columns = [
      { header: "Order ID", key: "_id", width: 25 },
      { header: "User", key: "user", width: 20 },
      { header: "Total Amount", key: "totalAmount", width: 15 },
      { header: "Status", key: "status", width: 15 },
    ];

    salesData.forEach((data) => {
      worksheet.addRow({
        _id: data._id,
        user: data.userId.name,
        totalAmount: `₹${data.totalAmount.toFixed(2)}`,
        status: data.status,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=sales_report.xlsx");

    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).send("Failed to generate Excel");
  }
};



// const downloadPdf = async (req, res) => {
//   try {
//     const salesData = req.body.salesData; 
    
//     const pdfDoc = new PDFDocument({ margin: 30 });

    
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');

    
//     pdfDoc.pipe(res);

    
//     pdfDoc.fontSize(18).text('Sales Report', { align: 'center' }).moveDown();

    
//     const tableTop = 100;
//     const cellPadding = 5;
//     const columnWidths = [150, 100, 100, 100]; 
    
//     const headers = ['Order ID', 'User Name', 'Total Amount', 'Status'];
//     let x = 50; 

//     pdfDoc.fontSize(12).font('Helvetica-Bold');

//     headers.forEach((header, index) => {
//       pdfDoc
//         .rect(x, y, columnWidths[index], 20) 
//         .stroke()
//         .text(header, x + cellPadding, y + cellPadding, { width: columnWidths[index] - cellPadding });
//       x += columnWidths[index]; 
//     });

   
//     y += 20; 
//     pdfDoc.fontSize(10).font('Helvetica');
//     salesData.forEach((order) => {
//       x = 50;
//       const rowData = [
//         order._id,
//         order.userId.name,
//         `${order.totalAmount.toLocaleString('en-IN')}`,
//         order.status,
//       ];

//       rowData.forEach((data, index) => {
//         pdfDoc
//           .rect(x, y, columnWidths[index], 20) 
//           .stroke()
//           .text(data, x + cellPadding, y + cellPadding, { width: columnWidths[index] - cellPadding });
//         x += columnWidths[index];
//       });
//       y += 20; 
//     });

//     // Finalize the document
//     pdfDoc.end();
//   } catch (error) {
//     console.error('Error generating PDF:', error);
//     res.status(500).send('Failed to generate PDF');
//   }
// };


// const downloadExcel = async (req, res) => {
//     try {
//       const salesData = req.body.salesData; // Parse sales data sent from the frontend
  
//       const workbook = new excelJS.Workbook();
//       const worksheet = workbook.addWorksheet('Sales Report');
  
//       // Define worksheet columns
//       worksheet.columns = [
//         { header: 'Order ID', key: '_id', width: 30 },
//         { header: 'User', key: 'user', width: 30 },
//         { header: 'Total Amount', key: 'totalAmount', width: 15 },
//         { header: 'Status', key: 'status', width: 20 },
//       ];
  
//       // Add rows to the worksheet
//       salesData.forEach((data) => {
//         worksheet.addRow({
//           _id: data._id,
//           user: data.userId.name,
//           totalAmount: data.totalAmount,
//           status: data.status,
//         });
//       });
  
//       // Set the response headers
//       res.setHeader(
//         'Content-Type',
//         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//       );
//       res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');
  
//       // Write the workbook to the response
//       await workbook.xlsx.write(res);
//       res.status(200).end();
//     } catch (error) {
//       console.error('Error generating Excel:', error);
//       res.status(500).send('Failed to generate Excel');
//     }
//   };
module.exports={
  renderSalesReportPage,
  getSalesReport,
  downloadExcel,
  downloadPdf
}