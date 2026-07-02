import {
  getYouTubeVideoIdFromUrl,
  getInstagramPostIdFromUrl,
  detectVideoPlatform,
} from "../lib/video"

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  FAIL: ${message}`)
    process.exit(1)
  }
  console.log(`  PASS: ${message}`)
}

let passed = 0
let total = 0
function check(condition: boolean, message: string) {
  total++
  if (condition) {
    passed++
    console.log(`  PASS: ${message}`)
  } else {
    console.error(`  FAIL: ${message}`)
    process.exit(1)
  }
}

console.log("=== getYouTubeVideoIdFromUrl ===\n")

check(
  getYouTubeVideoIdFromUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ") ===
    "dQw4w9WgXcQ",
  "youtube.com/watch?v=... extracts the video ID"
)
check(
  getYouTubeVideoIdFromUrl("https://youtu.be/dQw4w9WgXcQ") === "dQw4w9WgXcQ",
  "youtu.be/... extracts the video ID"
)
check(
  getYouTubeVideoIdFromUrl("https://www.youtube.com/shorts/abc123XYZ_-") ===
    "abc123XYZ_-",
  "youtube.com/shorts/... extracts video ID"
)
check(
  getYouTubeVideoIdFromUrl("https://youtube.com/watch?v=abc&t=30s") === "abc",
  "extra query params are ignored"
)
check(
  getYouTubeVideoIdFromUrl("dQw4w9WgXcQ") === "dQw4w9WgXcQ",
  "bare 11-char ID returns the ID"
)
check(
  getYouTubeVideoIdFromUrl("https://instagram.com/p/xyz/") === null,
  "Instagram URL returns null"
)

console.log("\n=== getInstagramPostIdFromUrl ===\n")

check(
  getInstagramPostIdFromUrl("https://www.instagram.com/p/CxYxZzABCDe/") ===
    "CxYxZzABCDe",
  "instagram.com/p/... extracts post ID"
)
check(
  getInstagramPostIdFromUrl("https://instagram.com/reel/CxYxZzABCDe") ===
    "CxYxZzABCDe",
  "instagram.com/reel/... extracts post ID"
)
check(
  getInstagramPostIdFromUrl(
    "https://www.instagram.com/reel/CxYxZzABCDe/?igsh=abc"
  ) === "CxYxZzABCDe",
  "query params are stripped"
)
check(
  getInstagramPostIdFromUrl("https://youtu.be/dQw4w9WgXcQ") === null,
  "YouTube URL returns null"
)

console.log("\n=== detectVideoPlatform ===\n")

check(
  detectVideoPlatform("https://www.youtube.com/watch?v=dQw4w9WgXcQ") ===
    "youtube",
  "YouTube watch URL detected as youtube"
)
check(
  detectVideoPlatform("https://youtu.be/dQw4w9WgXcQ") === "youtube",
  "youtu.be URL detected as youtube"
)
check(
  detectVideoPlatform("https://www.youtube.com/shorts/abc123XYZ_-") ===
    "youtube",
  "YouTube Shorts detected as youtube"
)
check(
  detectVideoPlatform("https://www.instagram.com/p/CxYxZzABCDe/") ===
    "instagram",
  "Instagram post URL detected as instagram"
)
check(
  detectVideoPlatform("https://instagram.com/reel/CxYxZzABCDe") === "instagram",
  "Instagram reel URL detected as instagram"
)
check(
  detectVideoPlatform("https://example.com/video") === null,
  "Unknown URL returns null"
)

console.log(`\n🎉 All ${passed}/${total} tests passed!`)
