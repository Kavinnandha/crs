import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPG and PNG are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'File size exceeds 1MB limit.' },
                { status: 400 }
            );
        }

        // Extract and validate file extension based on MIME type
        let extension = '.jpg';
        if (file.type === 'image/png') {
            extension = '.png';
        } else if (file.type === 'image/jpeg') {
            extension = '.jpg';
        }

        // Create safe filename using only timestamp
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const filename = `${timestamp}_${randomSuffix}${extension}`;

        // Get file buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure upload directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'customers');
        await mkdir(uploadDir, { recursive: true });

        // Save file
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        // Return the public URL path
        const publicPath = `/uploads/customers/${filename}`;

        return NextResponse.json({
            success: true,
            path: publicPath,
            filename: filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
