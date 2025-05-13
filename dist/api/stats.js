"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const rss_parser_1 = __importDefault(require("rss-parser"));
const ejs = __importStar(require("ejs"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_cron_1 = __importDefault(require("node-cron"));
const parser = new rss_parser_1.default({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'max-age=0',
        'Upgrade-Insecure-Requests': '1'
    }
});
function fetchRSSFeed(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const feed = yield parser.parseURL(url);
        let totalPosts = 0;
        let totalViews = 0; // Assuming views are calculated elsewhere
        let totalComments = 0; // Assuming comments are calculated elsewhere
        feed.items.forEach((item) => {
            console.log(item.title, item.link, item.pubDate);
            totalPosts++;
            // Additional logic to calculate views and comments if needed
        });
        return { totalPosts, totalViews, totalComments };
    });
}
exports.default = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { blogName } = req.query;
    const rssUrl = `https://${blogName}.tistory.com/rss`;
    const { totalPosts, totalViews, totalComments } = yield fetchRSSFeed(rssUrl);
    const templatePath = path_1.default.join(__dirname, '../templates/badge.ejs');
    const template = fs_1.default.readFileSync(templatePath, 'utf-8');
    const svg = ejs.render(template, { totalPosts, totalViews, totalComments });
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'max-age=600, s-maxage=86400, stale-while-revalidate=86400');
    res.status(200).send(svg);
    // Schedule RSS feed updates every hour
    node_cron_1.default.schedule('0 * * * *', () => {
        fetchRSSFeed(rssUrl);
    });
});
