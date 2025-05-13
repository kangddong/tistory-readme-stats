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
const axios_1 = __importDefault(require("axios"));
const qs = __importStar(require("querystring"));
const ejs = __importStar(require("ejs"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const TISTORY_CLIENT_ID = process.env.TISTORY_CLIENT_ID;
const TISTORY_CLIENT_SECRET = process.env.TISTORY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
function getAccessToken(refreshToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.post('https://www.tistory.com/oauth/access_token', qs.stringify({
            client_id: TISTORY_CLIENT_ID,
            client_secret: TISTORY_CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        }));
        return response.data.access_token;
    });
}
function fetchPosts(blogName, page, accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get(`https://www.tistory.com/apis/post/list?blogName=${blogName}&page=${page}&output=json&access_token=${accessToken}`);
        return response.data;
    });
}
function fetchViewCount(postUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get(postUrl);
        const match = response.data.match(/<span class="view-count">(\d+)<\/span>/);
        return match ? parseInt(match[1], 10) : 0;
    });
}
exports.default = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { blogName } = req.query;
    let accessToken = yield getAccessToken('your_refresh_token'); // Replace with actual refresh token logic
    let page = 1;
    let totalPosts = 0;
    let totalViews = 0;
    let totalComments = 0;
    while (true) {
        const data = yield fetchPosts(blogName, page, accessToken);
        if (!data.tistory || !data.tistory.item || data.tistory.item.posts.length === 0)
            break;
        totalPosts += data.tistory.item.posts.length;
        for (const post of data.tistory.item.posts) {
            totalViews += yield fetchViewCount(post.postUrl);
            totalComments += post.comments;
        }
        page++;
    }
    const templatePath = path_1.default.join(__dirname, '../templates/badge.ejs');
    const template = fs_1.default.readFileSync(templatePath, 'utf-8');
    const svg = ejs.render(template, { totalPosts, totalViews, totalComments });
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'max-age=600, s-maxage=86400, stale-while-revalidate=86400');
    res.status(200).send(svg);
});
