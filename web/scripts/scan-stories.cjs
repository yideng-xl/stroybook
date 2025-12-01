const fs = require('fs');
const path = require('path');

// Configuration
const STORIES_DIR = path.resolve(__dirname, '../../stories');
const OUTPUT_FILE = path.resolve(__dirname, '../public/story-manifest.json');
const ALLOWED_IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp'];

console.log('🔍 Scanning stories from:', STORIES_DIR);

function scanStories() {
  if (!fs.existsSync(STORIES_DIR)) {
    console.error('❌ Stories directory not found!');
    process.exit(1);
  }

  const stories = [];
  const storyDirs = fs.readdirSync(STORIES_DIR);

  for (const dir of storyDirs) {
    const storyPath = path.join(STORIES_DIR, dir);
    const stat = fs.statSync(storyPath);

    if (stat.isDirectory()) {
      // 1. Check for story.json
      const metadataPath = path.join(storyPath, 'story.json');
      if (!fs.existsSync(metadataPath)) {
        console.warn(`⚠️ Skipping "${dir}": story.json not found.`);
        continue;
      }

      try {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        const storyId = dir;

        // 2. Scan for Styles (Sub-directories)
        const styles = [];
        const subItems = fs.readdirSync(storyPath);
        
        for (const item of subItems) {
            const itemPath = path.join(storyPath, item);
            if (fs.statSync(itemPath).isDirectory()) {
                const styleId = item;
                // Check if this style has images (at least page-1)
                const coverImage = findCoverImage(itemPath);
                
                if (coverImage) {
                    styles.push({
                        id: styleId,
                        name: styleId, // Use dir name as style name for now
                        coverImage: `/stories/${storyId}/${styleId}/${coverImage}`
                    });
                }
            }
        }

        if (styles.length === 0) {
            console.warn(`⚠️ Skipping "${dir}": No valid styles found.`);
            continue;
        }

        stories.push({
          id: storyId,
          titleZh: metadata.titleZh || dir,
          titleEn: metadata.titleEn || dir,
          styles: styles,
          defaultStyle: styles[0].id // Default to the first found style
        });

        console.log(`✅ Found story: "${metadata.titleZh}" with ${styles.length} styles.`);

      } catch (err) {
        console.error(`❌ Error parsing ${metadataPath}:`, err.message);
      }
    }
  }

  // Write Manifest
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(stories, null, 2));
  console.log(`
🎉 Manifest generated at: ${OUTPUT_FILE}`);
  console.log(`Total stories: ${stories.length}`);
}

function findCoverImage(stylePath) {
    // Look for page-1.png, page-1.jpg, etc.
    for (const ext of ALLOWED_IMAGE_EXTS) {
        const filename = `page-1${ext}`;
        if (fs.existsSync(path.join(stylePath, filename))) {
            return filename;
        }
    }
    return null;
}

scanStories();
