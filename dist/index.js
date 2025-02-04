"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const index_1 = __importDefault(require("./routes/index"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: "Too many requests, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.json({ message: "Working fine sss" });
    }
    catch (error) {
        console.log(error);
    }
}));
app.use("/api/v1", index_1.default);
app.use((error, req, res, next) => {
    const errorMessage = error.message || "Something went wrong";
    const errorStatus = error.status || 500;
    res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
    });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
