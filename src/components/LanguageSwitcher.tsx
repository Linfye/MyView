"use client";

import { useEffect, useMemo, useState } from "react";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";

type Lang = "zh" | "en";

const textMap: Record<string, string> = {
  "构建属于你个体的数字文化记忆中枢": "Build your personal cultural memory hub",
  "立即登录": "Log in",
  "注册通行证": "Sign up",
  "了解 MyView 的产品信念": "Learn about MyView",
  "登录 MyView": "Log in to MyView",
  "进入你的私人精神角落": "Enter your private cultural space",
  "电子邮箱 (Email)": "Email",
  "密码 (Password)": "Password",
  "登录中...": "Logging in...",
  "登 录": "Log in",
  "还没有账号？": "No account yet?",
  "立即注册": "Sign up",
  "忘记密码？": "Forgot password?",
  "通过邮箱重置": "Reset by email",
  "创建 MyView 账号": "Create a MyView account",
  "开启你的私人文化记忆归档": "Start your private cultural archive",
  "唯一用户名 (Username)": "Username",
  "已有账号？": "Already have an account?",
  "重置密码": "Reset password",
  "输入注册邮箱，我们会发送一封验证邮件。":
    "Enter your email and we will send a verification link.",
  "发送重置邮件": "Send reset email",
  "正在发送...": "Sending...",
  "设置新密码": "Set a new password",
  "邮箱验证已通过，请输入你的新密码。":
    "Email verified. Enter your new password.",
  "新密码": "New password",
  "再次输入新密码": "Confirm new password",
  "保存新密码": "Save new password",
  "正在保存...": "Saving...",
  "重置邮件已发送，请打开邮箱中的链接继续设置新密码。":
    "Reset email sent. Open the link in your inbox to set a new password.",
  "电子邮箱": "Email",
  "想起密码了？": "Remembered your password?",
  "返回登录": "Back to log in",
  "注册申请提交成功。请前往您的电子邮箱查收激活信，点击链接即可开通账号。":
    "Signup request submitted. Check your inbox and click the activation link to open your account.",
  "没有收到？请检查垃圾邮件箱或稍后重试。":
    "Did not receive it? Check spam or try again later.",
  "正在申请数字通关令...": "Requesting access...",
  "书影归档": "Archive",
  "数据统计": "Stats",
  "公共库": "Library",
  "关于": "About",
  "退出": "Sign out",
  "我的账户": "Account",
  "关于 MyView": "About MyView",
  "记录你的精神留痕与文化记忆。": "Record your cultural memory.",
  "私密优先": "Privacy first",
  "可视化复盘": "Visual review",
  "添加新纪录": "Add a new entry",
  "归档你的文化足迹。": "Archive your cultural trail.",
  "分类": "Category",
  "电影 / 剧集": "Movie / Series",
  "图书 / 文献": "Book / Literature",
  "链接权威公共库": "Link public authority ID",
  "(选填)": "(optional)",
  "作品名称": "Title",
  "导演 / 作者": "Director / Author",
  "出版/上映年份": "Year",
  "我的评分 (10分制)": "My rating (out of 10)",
  "记录状态": "Status",
  "隐私控制": "Visibility",
  "已看完": "Completed",
  "正处于": "In progress",
  "想看/想读": "Wishlist",
  "公开展示": "Public",
  "仅自己可见": "Private",
  "记录时间": "Record time",
  "当前标记时间": "Current time",
  "到分钟": "to minute",
  "自定义时间": "Custom time",
  "自定义精度": "Custom precision",
  "精确到天": "Day",
  "仅记年月": "Month",
  "仅记年份": "Year",
  "选择时间": "Choose time",
  "选择年份": "Choose year",
  "选择月份": "Choose month",
  "选择日期": "Choose day",
  "一句话短评": "Short note",
  "深度长评 (支持 Markdown)": "Long review (Markdown supported)",
  "取消": "Cancel",
  "归档存储": "Save entry",
  "批量导入 JSON": "Bulk import JSON",
  "支持电影和书籍记录，名称只取前两段，导入评分、标记时间和出版年。":
    "Supports movie and book records. Only the first two name segments are used, importing rating, marked date, and publication year.",
  "上传 JSON": "Upload JSON",
  "文件格式不支持": "Unsupported file format",
  "请上传 JSON 文件。": "Please upload a JSON file.",
  "文件太大": "File too large",
  "JSON 文件不能超过 1MB。": "JSON file must be under 1 MB.",
  "请重新登录后再导入。": "Please log in again before importing.",
  "导入失败": "Import failed",
  "JSON 顶层必须是数组。": "The top-level JSON value must be an array.",
  "没有找到可导入的有效条目。": "No valid entries were found to import.",
  "导入完成": "Import complete",
  "JSON 文件无法解析。": "The JSON file could not be parsed.",
  "海报图片": "Poster image",
  "封面图片": "Cover image",
  "可选。支持常见图片格式，最大 2MB。":
    "Optional. Common image formats supported, max 2 MB.",
  "海报预览": "Poster preview",
  "移除海报": "Remove poster",
  "上传海报": "Upload poster",
  "上传封面": "Upload cover",
  "图片格式不支持": "Unsupported image format",
  "请上传 JPG、PNG、WebP 等图片文件。":
    "Upload a JPG, PNG, WebP, or similar image file.",
  "图片太大": "Image too large",
  "海报图片不能超过 2MB。": "Poster image must be under 2 MB.",
  "海报上传失败": "Poster upload failed",
  "请稍后重试。": "Please try again later.",
  "登录状态已失效": "Login session expired",
  "请重新登录后再保存。": "Please log in again before saving.",
  "保存失败": "Save failed",
  "已归档": "Archived",
  "这条文化记忆已经保存。": "This cultural memory has been saved.",
  "系统会保存为大写字母。如果该 ID 在公共库中不存在，系统将自动发起收录，由管理员后续补全其多语言元数据。":
    "The system saves this as uppercase. If the ID is not in the public library, it will be queued for admin metadata completion.",
  "电影 / 剧集名称": "Movie / Series title",
  "书籍 / 文献名称": "Book / Literature title",
  "导演 / 主创": "Director / Creator",
  "作者 / 编者": "Author / Editor",
  "上映年份": "Release year",
  "出版年份": "Publication year",
  "用于连接 IMDb 等电影公共库。如果该 ID 在公共库中不存在，系统将自动发起收录。":
    "Connects to movie libraries such as IMDb. If the ID is not in the public library, it will be queued for inclusion.",
  "用于连接 Wikidata 等书籍公共库。如果该 ID 在公共库中不存在，系统将自动发起收录。":
    "Connects to book libraries such as Wikidata. If the ID is not in the public library, it will be queued for inclusion.",
  "正在看": "Watching",
  "正在读": "Reading",
  "已读完": "Finished reading",
  "想看": "Want to watch",
  "想读": "Want to read",
  "观看时间": "Watch date",
  "阅读时间": "Reading date",
  "深度影评 (支持 Markdown)": "Long film review (Markdown supported)",
  "读书笔记 (支持 Markdown)": "Reading notes (Markdown supported)",
  "我的书影归档": "My archive",
  "记录、复盘、封存属于你个人的精神自留地。":
    "Record, review, and preserve your personal cultural space.",
  "+ 记录新书影": "+ New entry",
  "正在导出...": "Exporting...",
  "导出 JSON": "Export JSON",
  "所有评分": "All ratings",
  "10分 神作": "10 Masterpiece",
  "8-9分 杰作": "8-9 Excellent",
  "6-7分 及格": "6-7 Pass",
  "6分以下": "Below 6",
  "所有时代": "All eras",
  "时代 2020s": "2020s",
  "时代 2010s": "2010s",
  "时代 2000s": "2000s",
  "时代 90s": "1990s",
  "1950以前": "Before 1950",
  "世纪老片/古籍": "Older works",
  "每页 20": "20 per page",
  "每页 50": "50 per page",
  "每页 100": "100 per page",
  "卡片视图": "Card view",
  "列表视图": "List view",
  "未找到匹配的归档记录。": "No matching entries found.",
  "电影": "Movie",
  "图书": "Book",
  "私人": "Private",
  "公开": "Public",
  "未知主创": "Unknown creator",
  "未知": "Unknown",
  "作品": "Work",
  "主创": "Creator",
  "类型": "Type",
  "评分": "Rating",
  "操作": "Action",
  "编辑": "Edit",
  "选择本页": "Select page",
  "选择归档": "Select entry",
  "删除所选归档？": "Delete selected entries?",
  "正在删除...": "Deleting...",
  "上一页": "Previous",
  "下一页": "Next",
  "神作": "Masterpiece",
  "杰作": "Excellent",
  "及格": "Pass",
  "糟糕": "Poor",
  "全方位复盘你的精神足迹与文化偏好。":
    "Review your cultural footprint and preferences.",
  "已看电影 / 剧集": "Movies / Series",
  "已读图书 / 文献": "Books / Literature",
  "评分分布与比例": "Rating distribution",
  "评分分布": "Rating distribution",
  "统计各个分数的数量占比": "Count and share of each rating",
  "只显示有记录的分数。": "Only scores with entries are shown.",
  "时间分布": "Time distribution",
  "按作品年份每 10 年归档。": "Grouped by work year in 10-year buckets.",
  "按作品年份每 50 年归档。": "Grouped by work year in 50-year buckets.",
  "暂无评分数据": "No rating data yet",
  "暂无年份数据": "No year data yet",
  "归档动态趋势": "Archive activity trend",
  "分别查看电影和图书的归档节奏。":
    "View archive rhythm for movies and books separately.",
  "按月": "Monthly",
  "按年": "Yearly",
  "今年至今": "This year",
  "过去1年": "Past 1 year",
  "过去2年": "Past 2 years",
  "过去3年": "Past 3 years",
  "过去5年": "Past 5 years",
  "最早至今": "All time",
  "按年月统计看过的电影与图书总量趋势（近6个月）":
    "Monthly trend of watched movies and read books over the last 6 months",
  "暂无时间分布数据": "No timeline data yet",
  "个人资料设置": "Profile settings",
  "管理你的公开用户名片与个人资料。":
    "Manage your public profile and account details.",
  "修改密码": "Change password",
  "输入旧密码验证身份，然后设置新密码。":
    "Verify with your current password, then set a new one.",
  "当前密码": "Current password",
  "更新密码": "Update password",
  "唯一用户名 ID (Username)": "Username",
  "展示昵称 (Display Name)": "Display name",
  "外部联系方式 (可选)": "Contact info (optional)",
  "数字自白 / 简介 (Bio)": "Bio",
  "保存修改": "Save changes",
  "方便他人在其他平台精准锁定你并取得联系。":
    "Help others find and contact you on other platforms.",
  "正在更新...": "Updating...",
  "正在调取个人资料...": "Loading profile...",
  "更新失败": "Update failed",
  "该用户名已被他人占用，请换一个。":
    "That username is already taken. Please choose another.",
  "资料已更新": "Profile updated",
  "你的私人数字名片已经保存。": "Your profile card has been saved.",
  "密码太短": "Password too short",
  "新密码至少需要 6 个字符。":
    "New password must be at least 6 characters.",
  "两次输入的新密码不一致。": "The two new passwords do not match.",
  "两次密码不一致": "Passwords do not match",
  "请重新输入新密码。": "Please enter the new password again.",
  "旧密码不正确": "Current password is incorrect",
  "请确认当前密码后再试。":
    "Please confirm your current password and try again.",
  "密码修改失败": "Password update failed",
  "密码已更新": "Password updated",
  "下次登录请使用新密码。": "Use the new password next time you log in.",
  "公共库维护后台": "Public library admin",
  "管理员专属。在这里补充、校对由用户自发扩容触发的全球权威 ID 词条。":
    "Admin only. Complete and review public authority records.",
  "权威 ID / 分类": "Authority ID / Type",
  "当前元数据状态": "Metadata status",
  "当前权威公共库没有任何条目。": "The public library is empty.",
  "录入元数据": "Add metadata",
  "修改校对": "Review",
  "待补充元数据 (壳词条)": "Metadata pending",
  "未命名": "Untitled",
  "编纂权威文献元数据": "Edit authority metadata",
  "正在调取词条档案...": "Loading authority record...",
  "正在为通用大写 ID 注入标准多语言属性。":
    "Adding standard multilingual metadata for this uppercase authority ID.",
  "发布权威词条": "Publish record",
  "正在写入主库...": "Writing to library...",
  "正在为通用大写 ID": "Adding standard multilingual metadata for authority ID",
  "注入标准多语言属性。": ".",
  "中文规范名 (Title ZH)": "Chinese title",
  "英文规范名 (Title EN)": "English title",
  "原始语言首发片名/书名 (Original Title)": "Original title",
  "标准主创姓名 (导演/作者)": "Creator",
  "首发/上映年份": "First published year",
  "原产国语种缩写": "Original language",
  "获取权威词条失败": "Failed to load authority record",
  "更新权威库失败": "Failed to update public library",
  "权威词条已发布": "Authority record published",
  "公共库元数据已经更新。": "Public library metadata has been updated.",
  "返回归档": "Back to archive",
  "深度长评": "Long review",
  "暂未记录长评。": "No long review yet.",
  "私人可见": "Private",
  "编辑归档记录": "Edit archive entry",
  "删除此记录": "Delete this entry",
  "正在读取原归档数据...": "Loading archive entry...",
  "(选填/可编辑修改)": "(optional / editable)",
  "时间记录精度": "Time precision",
  "保存修改...": "Saving changes...",
  "更新归档": "Update archive",
  "删除这条归档？": "Delete this archive entry?",
  "删除": "Delete",
  "删除失败": "Delete failed",
  "已删除": "Deleted",
  "这条归档已移除。": "This archive entry has been removed.",
  "获取数据失败": "Failed to load data",
  "已更新": "Updated",
  "归档记录已经保存。": "Archive entry has been saved.",
  "也想建立自己的书影归档？": "Want your own archive?",
  "注册 MyView，记录评分、短评、长评和你的文化时间线。":
    "Sign up for MyView to record ratings, notes, long reviews, and your cultural timeline.",
  "免费注册": "Sign up free",
  "已有账号登录": "Log in",
  "关闭关于": "Close about",
  "MyView 是一个私人文化记忆空间，用来沉淀电影、图书和那些真正改变过你的作品。":
    "MyView is a private cultural memory space for films, books, and works that truly changed you.",
  "它不追求公开点赞和推荐算法，而是帮助你把观看、阅读、评分和长评留在一个稳定、可回看的结构里。":
    "It does not chase likes or recommendation algorithms. It helps you keep viewing, reading, ratings, and reviews in a stable structure you can revisit.",
  "数据围绕你的个人资料与文化归档组织，不制造公开社交压力。":
    "Data is organized around your profile and archive without public social pressure.",
  "通过评分、时间线和归档趋势看见自己的文化轨迹。":
    "See your cultural trajectory through ratings, timelines, and archive trends.",
  "确认": "Confirm",
  "关闭通知": "Close notification",
  "秒后自动继续": "seconds until continuing",
  "正在接入您的文化记忆归档...": "Connecting to your cultural archive...",
  "正在为您下发全网安全数字令，请稍候":
    "Issuing your secure access token. Please wait.",
  "邮箱验证成功": "Email verified",
  "欢迎来到 MyView。您的专属安全数字秘钥已成功下发至当前浏览器。":
    "Welcome to MyView. Your secure browser session is ready.",
  "返回登录页重新申请": "Return to login and request again",
  "传送安全令已失效": "The access link has expired",
  "该邮件验证链接可能已被使用过，或由于超时已在边缘网络中过期。":
    "This verification link may already have been used, or it may have expired.",
  "绝对纯净": "Pure by design",
  "记忆可视化": "Memory visualization",
  "进入我的看板": "Open my dashboard",
  "返回上页": "Back",
  "记录你的精神留痕与文化记忆": "Record your cultural memory",
  "在这个被算法推荐和信息茧房裹挟的时代，我们每天都在被动消费着海量的碎片化内容。那些真正触动过我们的电影、启发过我们的书籍，往往在滑动手指的瞬间便隐入烟尘。":
    "In an age shaped by recommendations and filter bubbles, we passively consume a flood of fragments every day. The films and books that truly moved us often vanish as quickly as the next swipe.",
  "诞生于一个极其朴素的想法：":
    "was born from a very simple idea:",
  "为个体构建一座对抗遗忘的数字避难所":
    " build a digital refuge against forgetting for the individual",
  "。这里没有虚荣的点赞数量，没有复杂的社交攀比，只有你与文化作品之间的纯粹共鸣。":
    ". There are no vanity likes or social comparisons here, only the resonance between you and the works that mattered.",
  "无论是午夜看完的一部冷门老片，还是枕边读了过半的晦涩诗集，你都可以将其安全地归档在此处。通过结构化的多维记录与私密的数据沉淀，MyView":
    "Whether it is an obscure late-night film or a difficult poetry collection half-read by your bed, you can archive it here. Through structured records and private data, MyView",
  "无论是午夜看完的一部冷门老片，还是枕边读了过半的晦涩诗集，你都可以将其安全地归档在此处。通过结构化的多维记录与私密的数据沉淀，MyView 将帮助你绘制出专属的心灵演化轨迹。":
    "Whether it is an obscure late-night film or a difficult poetry collection half-read by your bed, you can archive it here. Through structured records and private data, MyView helps you trace your own inner evolution.",
  "将帮助你绘制出专属的心灵演化轨迹。":
    "helps you trace your own inner evolution.",
  "无广告、无推荐算法，100% 属于你个体的数字资产。":
    "No ads, no recommendation algorithm, fully your own digital asset.",
  "多维度的数据统计看板，清晰看见自己的精神图谱。":
    "A multidimensional stats board that lets you see your cultural map clearly.",
  "部": "movies",
  "本": "books",
  "系统会保存为大写字母。如果该 ID": "The system saves this as uppercase. If the ID",
  "在公共库中不存在，系统将自动发起收录，由管理员后续补全其多语言元数据。":
    "is not in the public library, it will be queued for admin multilingual metadata completion.",
};

const placeholderMap: Record<string, string> = {
  "搜索作品名、导演作者、权威 ID...":
    "Search title, creator, or authority ID...",
  "输入 IMDb ID (如: tt1375666)": "Enter IMDb ID (e.g. tt1375666)",
  "输入 Wikidata QID (如: Q13417184)": "Enter Wikidata QID (e.g. Q13417184)",
  "如：星际穿越": "e.g. Interstellar",
  "如：百年孤独": "e.g. One Hundred Years of Solitude",
  "如：诺兰": "e.g. Nolan",
  "如：克里斯托弗·诺兰": "e.g. Christopher Nolan",
  "如：加西亚·马尔克斯": "e.g. Gabriel Garcia Marquez",
  "如：2014": "e.g. 2014",
  "用一句话总结你的核心感受...": "Summarize your impression in one sentence...",
  "用一句话总结你的观影感受...": "Summarize your viewing impression in one sentence...",
  "用一句话总结你的阅读感受...": "Summarize your reading impression in one sentence...",
  "写下更详细的剖析...": "Write a deeper analysis...",
  "写下更详细的观影剖析...": "Write a deeper film analysis...",
  "写下更详细的阅读笔记...": "Write more detailed reading notes...",
  "例如: kuro": "e.g. kuro",
  "your@email.com": "your@email.com",
  "仅限字母和数字，如 kuro": "Letters and numbers only, e.g. kuro",
  "如：玄黑": "e.g. Kuro",
  "微信: xxx / 邮箱: mail@example.com": "WeChat: xxx / Email: mail@example.com",
  "用几句话描述你的阅读/观影偏好...":
    "Describe your reading/viewing preferences...",
  "编辑 IMDb ID (如: TT1375666)": "Edit IMDb ID (e.g. TT1375666)",
  "编辑 Wikidata QID (如: Q13417184)":
    "Edit Wikidata QID (e.g. Q13417184)",
  "如：盗梦空间": "e.g. Inception",
  "非英美作品选填": "Optional for non-English works",
  "如：Christopher Nolan": "e.g. Christopher Nolan",
  "如：2010": "e.g. 2010",
  "如: en, zh, ja, fr": "e.g. en, zh, ja, fr",
};

function translatePlaceholder(value: string) {
  return placeholderMap[value] || value;
}

function translateText(value: string) {
  const compact = value.replace(/\s+/g, " ").trim();
  if (!compact) return value;
  if (textMap[compact]) return value.replace(compact, textMap[compact]);
  return value
    .replace(/第\s+(\d+)\s+\/\s+(\d+)\s+页/g, "Page $1 / $2")
    .replace(/共\s+(\d+)\s+条/g, "$1 total")
    .replace(/(\d+)\s+分/g, "$1 pts")
    .replace(/(\d+)\s+部\/本/g, "$1 entries")
    .replace(/(\d+)\s+部/g, "$1 movies")
    .replace(/(\d+)\s+本/g, "$1 books")
    .replace(/(\d+)月\s+\((\d+)年\)/g, "$1/$2")
    .replace(/(\d{4})年/g, "$1")
    .replace(/(\d+)秒后自动继续/g, "Continuing in $1 seconds")
    .replace(/删除所选 \((\d+)\)/g, "Delete selected ($1)")
    .replace(/已删除\s+(\d+)\s+条归档。/g, "$1 archive entries deleted.")
    .replace(
      /确定要删除选中的\s+(\d+)\s+条归档吗？此操作不可撤销。/g,
      "Delete the selected $1 archive entries? This cannot be undone.",
    )
    .replace(/正在修改《(.+)》的记忆档案。/g, "Editing archive entry for $1.")
    .replace(
      /确定要彻底删除《(.+)》的记忆档案吗？此操作不可撤销。/g,
      "Permanently delete the archive entry for $1? This cannot be undone.",
    )
    .replace(/返回\s+(.+)\s+的归档/g, "Back to $1's archive")
    .replace(/(.+)\s+的书影归档/g, "$1's archive");
}

function translateDocument(lang: Lang, originals: WeakMap<Node, string>) {
  document.documentElement.lang = lang === "en" ? "en" : "zh-CN";

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (
        parent.closest(
          "script, style, textarea, input, [data-no-translate='true']",
        )
      ) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  nodes.forEach((node) => {
    const current = node.nodeValue || "";
    if (!originals.has(node)) originals.set(node, current);
    let original = originals.get(node) || "";
    if (current !== original && current !== translateText(original)) {
      originals.set(node, current);
      original = current;
    }
    node.nodeValue = lang === "en" ? translateText(original) : original;
  });

  document.querySelectorAll<HTMLElement>("[placeholder]").forEach((el) => {
    const current = el.getAttribute("placeholder") || "";
    let original = el.dataset.originalPlaceholder || current;
    if (current !== original && current !== translatePlaceholder(original)) {
      original = current;
    }
    el.dataset.originalPlaceholder = original;
    el.setAttribute(
      "placeholder",
      lang === "en" ? translatePlaceholder(original) : original,
    );
  });

  document.querySelectorAll<HTMLElement>("[aria-label]").forEach((el) => {
    const current = el.getAttribute("aria-label") || "";
    let original = el.dataset.originalAriaLabel || current;
    if (current !== original && current !== translateText(original)) {
      original = current;
    }
    el.dataset.originalAriaLabel = original;
    el.setAttribute(
      "aria-label",
      lang === "en" ? textMap[original] || original : original,
    );
  });

  document.querySelectorAll<HTMLElement>("[alt]").forEach((el) => {
    const current = el.getAttribute("alt") || "";
    let original = el.dataset.originalAlt || current;
    if (current !== original && current !== translateText(original)) {
      original = current;
    }
    el.dataset.originalAlt = original;
    el.setAttribute("alt", lang === "en" ? textMap[original] || original : original);
  });
}

export default function LanguageSwitcher() {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "zh";
    return window.localStorage.getItem("myview-lang") === "en" ? "en" : "zh";
  });
  const originals = useMemo(() => new WeakMap<Node, string>(), []);

  useEffect(() => {
    translateDocument(lang, originals);
    window.localStorage.setItem("myview-lang", lang);
    document.cookie = `myview-lang=${lang}; path=/; max-age=31536000; samesite=lax`;

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(() => translateDocument(lang, originals));
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "aria-label", "alt"],
    });

    return () => observer.disconnect();
  }, [lang, originals]);

  return (
    <div
      className="fixed bottom-3 right-3 z-[120] flex items-center gap-1 rounded-xl border border-slate-200 bg-white/95 p-1 text-xs font-semibold shadow-sm backdrop-blur"
      data-no-translate="true"
    >
      <Languages className="ml-2 size-4 text-slate-400" />
      <button
        type="button"
        className={cn(
          "rounded-lg px-2.5 py-1.5 text-slate-500 transition-colors hover:bg-slate-50",
          lang === "zh" && "bg-teal-700 text-white hover:bg-teal-700",
        )}
        onClick={() => setLang("zh")}
      >
        中文
      </button>
      <button
        type="button"
        className={cn(
          "rounded-lg px-2.5 py-1.5 text-slate-500 transition-colors hover:bg-slate-50",
          lang === "en" && "bg-teal-700 text-white hover:bg-teal-700",
        )}
        onClick={() => setLang("en")}
      >
        EN
      </button>
    </div>
  );
}
