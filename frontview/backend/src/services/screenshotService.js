const puppeteer = require('puppeteer');
const cloudinary = require('cloudinary').v2;

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Captures a screenshot of the given URL and uploads it to Cloudinary.
 * @param {string} url - The URL of the deployed site.
 * @param {string} deploymentId - Unique ID for the deployment.
 * @returns {Promise<string|null>} - The Cloudinary URL of the uploaded screenshot.
 */
const captureAndUploadScreenshot = async (url, deploymentId) => {
  let browser;
  try {
    console.log(`📸 [ScreenshotService] Capturing screenshot for ${url}...`);
    
    // Launch headless browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    // Go to URL and wait for page to load
    await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 60000 
    });
    
    // Add a small delay for any JS-driven animations
    await new Promise(r => setTimeout(r, 2000));

    // Take screenshot as buffer
    const screenshotBuffer = await page.screenshot({ 
        type: 'png',
        fullPage: false 
    });
    
    console.log(`☁️ [ScreenshotService] Uploading to Cloudinary...`);
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'velora_previews',
          public_id: `preview_${deploymentId}`,
          overwrite: true,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) {
            console.error('❌ [ScreenshotService] Cloudinary upload failed:', error);
            reject(error);
          } else {
            console.log('✅ [ScreenshotService] Preview saved:', result.secure_url);
            resolve(result.secure_url);
          }
        }
      );
      
      uploadStream.end(screenshotBuffer);
    });
  } catch (error) {
    console.error('❌ [ScreenshotService] Error:', error.message);
    return null;
  } finally {
    if (browser) {
        await browser.close();
    }
  }
};

module.exports = { captureAndUploadScreenshot };
