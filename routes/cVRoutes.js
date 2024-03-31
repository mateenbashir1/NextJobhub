// Routes

const express = require('express');
const router = express.Router();

const cv=require('../controllers/cvRoutes')
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

router.post('/generate-cv', async (req, res) => {
    const { name, email, skills } = req.body;
    console.log('Received data:', req.body); // Add this line to log the received data

    try {
        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();

        // Set font and text size
        const fontSize = 20;

        // Add text to the PDF
        page.drawText(`Name: ${name}`, { x: 50, y: 750, size: fontSize });
        page.drawText(`Email: ${email}`, { x: 50, y: 720, size: fontSize });
        page.drawText('Skills:', { x: 50, y: 690, size: fontSize });
        skills.forEach((skill, index) => {
            page.drawText(`${index + 1}. ${skill}`, { x: 70, y: 660 - index * 30, size: fontSize });
        });

        // Save the PDF to a buffer
        const pdfBytes = await pdfDoc.save();

        // Send the PDF as a response
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBytes);
    } catch (error) {
        console.error('Error generating CV PDF:', error);
        res.status(500).json({ message: 'Failed to generate CV PDF', error: error.message });
    }
});



module.exports = router;
