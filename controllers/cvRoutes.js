const path = require('path');
const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');

// Controller function to generate and save the CV PDF
const generateCV = async (req, res) => {
    // Extract user data from request body
    const { name, email, skills, experiences, images } = req.body;

    try {
        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();

        // Set font and text size
        const fontSize = 20;

        // Add personal information to the PDF
        page.drawText(`Name: ${name}`, { x: 50, y: 750, size: fontSize });
        page.drawText(`Email: ${email}`, { x: 50, y: 720, size: fontSize });

        // Add skills section to the PDF
        page.drawText('Skills:', { x: 50, y: 690, size: fontSize });
        skills.forEach((skill, index) => {
            page.drawText(`${index + 1}. ${skill}`, { x: 70, y: 660 - index * 30, size: fontSize });
        });

        // Add experiences section to the PDF
        page.drawText('Experiences:', { x: 50, y: 400, size: fontSize });
        experiences.forEach((exp, index) => {
            page.drawText(`${index + 1}. ${exp.title} - ${exp.company}`, { x: 70, y: 370 - index * 30, size: fontSize });
            page.drawText(`   ${exp.duration}`, { x: 70, y: 350 - index * 30, size: fontSize - 2 });
        });

        // Add images to the PDF
        let yOffset = 100;
        images.forEach((imagePath, index) => {
            const imageBytes = fs.readFileSync(imagePath);
            const image =  pdfDoc.embedPng(imageBytes);
            page.drawImage(image, { x: 50, y: yOffset, width: 100, height: 100 });
            yOffset -= 120; // Adjust the vertical position for the next image
        });

        // Save the PDF to a buffer
        const pdfBytes = await pdfDoc.save();

        // Write the buffer to a file
        const filePath = path.join(__dirname, '..', 'cv.pdf');
        fs.writeFileSync(filePath, pdfBytes);

        console.log('CV PDF saved successfully');
        res.status(201).json({ message: 'CV PDF generated and saved successfully' });
    } catch (error) {
        console.error('Error generating and saving CV PDF:', error);
        res.status(500).json({ message: 'Failed to generate and save CV PDF', error: error.message });
    }
};

// Controller function to download the CV file
const downloadCV = async (req, res) => {
    const filePath = path.join(__dirname, '..', 'cv.pdf');

    try {
        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'CV file not found' });
        }

        // Set response headers for file download
        res.setHeader('Content-Disposition', 'attachment; filename=cv.pdf');
        res.setHeader('Content-Type', 'application/pdf');

        // Stream the file to the response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Error downloading CV:', error);
        res.status(500).json({ message: 'Failed to download CV', error: error.message });
    }
};

module.exports = {
    downloadCV,
    generateCV
};

