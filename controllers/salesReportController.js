
const excelJS = require("exceljs");
const PDFDocument = require("pdfkit-table");
const Order = require("../models/orderSchema");
const pdfTable = require("pdfkit-table");
const fs = require("fs");

require("pdfkit-table");

const renderSalesReportPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // console.log('page',page,'limit',limit,'skip',skip)

    const orders = await Order.aggregate([
      { $unwind: "$items" }, // Convert array of items into separate documents
      { $match: { "items.status": "Delivered" } }, // Only include delivered products
      {
        $lookup: {
          // Fetch user details
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" }, // Convert user array to object
      {
        $lookup: {
          // Fetch product details for each item
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" }, // Convert product array to object
      {
        $addFields: {
          "items.productName": "$productDetails.productName",
          "items.productCategory": "$productDetails.category",
          "items.productBrand": "$productDetails.brand",
          "items.productPrice": "$productDetails.price",
          "items.totalPrice": {
            $multiply: ["$items.quantity", "$items.productPrice"],
          },
        },
      },
      {
        $group: {
          // Group back by order ID after filtering items
          _id: "$_id",
          userId: { $first: "$userId" },
          userName: { $first: "$userDetails.name" },
          createdAt: { $first: "$createdAt" },
          paymentMethod: { $first: "$paymentMethod" },
          totalAmount: { $sum: "$items.totalPrice" }, // Sum up the correct total
          discount: { $first: "$discount" },
          items: { $push: "$items" }, // Ensure items array contains product details
        },
      },
      { $sort: { createdAt: -1 } }, // Sort by latest orders
      { $skip: skip },
      { $limit: limit },
    ]);
    // orders.forEach(order=>order.items.forEach(item=>console.log('item',item)))
    // console.log("Orders with product details: ", orders);

    // Calculate total revenue only from delivered products
    const totalRevenue = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.status": "Delivered" } },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
    ]);

    // Calculate total discount
    const totalOffer = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.status": "Delivered" } },
      {
        $group: {
          _id: null,
          Offer: { $sum: "$discount" },
        },
      },
    ]);
    let totalOrders=(await Order.aggregate([{$unwind:"$items"},{$match:{"items.status":"Delivered"}}])).length;
   
    const totalPages = Math.ceil(totalOrders / limit);
    // console.log("totalOrders",totalOrders,totalPages)

    res.render("salesreport", {
      orders,
      totalOrders,
      totalRevenue: totalRevenue[0]?.totalRevenue || 0,
      currentPage: page,
      totalPages,
      fil:"",
      totalOffer: totalOffer[0]?.Offer || 0,
    });
  } catch (error) {
    console.error("Error rendering sales report page:", error);
    res.status(500).send("Error rendering sales report page");
  }
};

const getSalesReport = async (req, res) => {
  try {
    const { filter, startDate, endDate, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    let filters=filter;
    let matchCondition = {};

    if (filter === "today") {
      const today = new Date();
      matchCondition.createdAt = {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999)),
      };
    } else if (filter === "weekly") {
      const today = new Date();
      const weekStart = new Date(
        today.setDate(today.getDate() - today.getDay())
      );
      matchCondition.createdAt = {
        $gte: weekStart,
        $lt: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000),
      };
    } else if (filter === "monthly") {
      const monthStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      );
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

 
    const orders = await Order.aggregate([
      { $match: matchCondition },
      { $unwind: "$items" }, // Convert array of items into separate documents
      { $match: { "items.status": "Delivered" } }, // Only include delivered products
      {
        $lookup: {
          // Fetch user details
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" }, // Convert user array to object
      {
        $lookup: {
          // Fetch product details for each item
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" }, // Convert product array to object
      {
        $addFields: {
          "items.productName": "$productDetails.productName",
          "items.productCategory": "$productDetails.category",
          "items.productBrand": "$productDetails.brand",
          "items.productPrice": "$productDetails.price",
          "items.totalPrice": {
            $multiply: ["$items.quantity", "$items.productPrice"],
          },
        },
      },
      {
        $group: {
          // Group back by order ID after filtering items
          _id: "$_id",
          userId: { $first: "$userId" },
          userName: { $first: "$userDetails.name" },
          createdAt: { $first: "$createdAt" },
          paymentMethod: { $first: "$paymentMethod" },
          totalAmount: { $sum: "$items.totalPrice" }, // Sum up the correct total
          discount: { $first: "$discount" },
          items: { $push: "$items" }, // Ensure items array contains product details
        },
      },
      { $sort: { createdAt: -1 } }, // Sort by latest orders
      { $skip: skip },
      { $limit: limit },
    ]);

    // Calculate total revenue only from delivered products
    const totalRevenue = await Order.aggregate([
      { $match: matchCondition },
      { $unwind: "$items" },
      { $match: { "items.status": "Delivered" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$items.price" },
        },
      },
    ]);
    const totalOffer = await Order.aggregate([
      { $match: matchCondition },
      { $unwind: "$items" },
      { $match: { "items.status": "Delivered" } },
      {
        $group: {
          _id: null,
          Offer: { $sum: "$discount" },
        },
      },
    ]);
    // console.log(filter,filters)

    let totalOrders=(await Order.aggregate([{ $match: matchCondition },{$unwind:"$items"},{$match:{"items.status":"Delivered"}}])).length;   
     const totalPages = Math.ceil(totalOrders / limit);

    res.render("salesreport", {
      orders,
      totalOrders,
      totalRevenue: totalRevenue[0]?.totalRevenue || 0,
      currentPage: parseInt(page),
      totalPages,
      fil:filters,
      totalOffer: totalOffer[0]?.Offer || 0,
    });
  } catch (error) {
    console.error("Error filtering sales report:", error);
    res.status(500).send("Error filtering sales report");
  }
};


const downloadPdf = async (req, res) => {
  try {
    const { filter, startDate, endDate } = req.query;
    let matchCondition = { "items.status": "Delivered" };

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

    const salesData = await Order.find(matchCondition)
      .populate("userId")
      .populate("items.productId")
      .lean();

    if (!salesData.length) {
      return res.status(404).send("No sales data found for the selected filter.");
    }

    // ✅ Calculate Total Income & Total Discount
    let totalIncome = 0;
    let totalDiscount = 0;

    salesData.forEach((order) => {
      order.items.forEach((item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        const discount = Number(order.discount) || 0;

        totalIncome += (price * quantity) - discount;
        totalDiscount += discount;
      });
    });

    // ✅ Generate PDF
    const pdfDoc = new PDFDocument({ margin: 30, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=sales_report.pdf");
    pdfDoc.pipe(res);

    // ✅ Add Title
    pdfDoc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text(`Sales Report - ${filter.toUpperCase()}`, { align: "center" })
      .moveDown(1);

    // ✅ Add Total Income & Total Discount (Top Left)
    pdfDoc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`Total Income: ₹${totalIncome.toLocaleString("en-IN")}`, { align: "left" })
      .moveDown(0.2)
      .text(`Total Discount: ₹${totalDiscount.toLocaleString("en-IN")}`, { align: "left" })
      .moveDown(1);

    // ✅ Table Headers
    const headers = [
      { label: "Order ID", property: "orderId", width: 90, align: "center" },
      { label: "User Name", property: "userName", width: 90, align: "center" },
      { label: "Product Name", property: "productName", width: 120, align: "center" },
      { label: "Qty", property: "quantity", width: 20, align: "center" },
      { label: "Price", property: "price", width: 70, align: "center" },
      { label: "Discount", property: "discount", width: 70, align: "center" },
      { label: "Total", property: "totalAmount", width: 80, align: "center" },
    ];

    // ✅ Table Data
    const rows = [];
    salesData.forEach((order) => {
      order.items.forEach((item) => {
        const productName = item.productId?.productName || "Unknown";
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const discount = Number(order.discount) || 0;
        const totalAmount = (quantity * price) - discount;

        rows.push([
          order._id.toString(),
          order.userId?.name || "N/A",
          productName,
          quantity.toString(),
          `₹${price.toLocaleString("en-IN")}`,
          `₹${discount.toLocaleString("en-IN")}`,
          `₹${totalAmount.toLocaleString("en-IN")}`,
        ]);
      });
    });

    // ✅ Add Table
    pdfDoc.table({ headers, rows }, {
      prepareHeader: () => pdfDoc.font("Helvetica-Bold").fontSize(10),
      prepareRow: () => pdfDoc.font("Helvetica").fontSize(9),
      columnSpacing: 5,
      rowSpacing: 4,
      width: 550,
    });

    // ✅ Finalize PDF
    pdfDoc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Failed to generate PDF");
  }
};


const downloadExcel = async (req, res) => {
  try {
    const { filter, startDate, endDate } = req.query;
    let matchCondition = { "items.status": "Delivered" };

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

    // Fetch sales data
    const salesData = await Order.find(matchCondition)
      .populate("userId")
      .populate("items.productId") // Ensure product details are included
      .lean();

    if (!salesData.length) {
      return res.status(404).send("No sales data found for the selected filter.");
    }

    // Create Excel Workbook & Worksheet
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    // Define Table Headers
    worksheet.columns = [
      { header: "Order ID", key: "orderId", width: 25, align: "center" },
      { header: "User Name", key: "userName", width: 20 , align: "center"},
      { header: "Product Name", key: "productName", width: 25 , align: "center" },
      { header: "Quantity", key: "quantity", width: 10 , align: "center"},
      { header: "Price", key: "price", width: 15 , align: "center"},
      { header: "Discount", key: "discount", width: 15, align: "center" },
      { header: "Total Amount", key: "totalAmount", width: 20 , align: "center"},
    ];

    // Add Data to Worksheet
    salesData.forEach((order) => {
      order.items.forEach((item) => {
        console.log("uahfgiouaghgviughviughriuaghuiahgaubhuiob",item)
        const productName = item.productId?.productName || "Unknown";
        const quantity = Number(item.quantity) ;
        const price = Number(item.price) || 0;
        const discount = Number(order.discount) || 0;
        const totalAmount = (quantity * price) - discount;

        worksheet.addRow({
          orderId: order._id.toString(),
          userName: order.userId?.name || "N/A",
          productName: productName,
          quantity: quantity,
          price: `₹${price.toLocaleString("en-IN")}`,
          discount: `₹${discount.toLocaleString("en-IN")}`,
          totalAmount: `₹${totalAmount.toLocaleString("en-IN")}`,
        });
      });
    });

    // Set Response Headers
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=sales_report.xlsx");

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).send("Failed to generate Excel");
  }
};


module.exports = {
  renderSalesReportPage,
  getSalesReport,
  downloadExcel,
  downloadPdf,
};
