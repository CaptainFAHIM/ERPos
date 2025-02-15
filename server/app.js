import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors()); // Enable CORS

//api routes
import productlistRoutes from './routes/productlist.routes.js';
import categoryRoutes from './routes/category.routes.js';
import brandRoutes from './routes/brand.routes.js';
import stockInRoutes from './routes/stockin.routes.js';
import supplierRoutes from "./routes/supplier.routes.js";
import damageProductRoutes from "./routes/damageproduct.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import expenseCategoryRoutes from "./routes/expenseCategory.routes.js";
import storeSettingsRoutes from "./routes/storeSettings.routes.js";
import salesRoutes from './routes/sales.routes.js';
import returnItemRoutes from './routes/sales_returns.routes.js';
import paySupplierRoutes from './routes/addpayments.routes.js';
import usersRoutes from './routes/users.routes.js';
import cartRoutes from './routes/cart.routes.js';
import transactionRoutes from './routes/transaction.routes.js';


app.use('/api/users', usersRoutes);
app.use('/api/productlist', productlistRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/stockin', stockInRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/damageproduct", damageProductRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/expenseCategories", expenseCategoryRoutes);
app.use("/api/storeSettings", storeSettingsRoutes);
app.use('/api/return-items', returnItemRoutes);
app.use('/api/payments', paySupplierRoutes);


// For selling products
app.use('/api/cart', cartRoutes);
app.use('/api/transactions', transactionRoutes);

app.use("/api/sales", salesRoutes)


//handle error
app.use((err,req,res,next)=>{
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";
    res.status(statusCode).json({
        success : "false",
        statusCode,
        message
    });
});

export {app};
