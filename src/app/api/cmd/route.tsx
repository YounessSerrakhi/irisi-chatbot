// Import necessary modules
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';

// Define your API route handler
export async function POST(request: NextRequest) {
  try {

    // Execute the "clear" command (replace with your desired command)
    exec('npm run ingest', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return NextResponse.json({ success: false, error: error.message });
      }

      if (stderr) {
        console.error(`Command stderr: ${stderr}`);
        return NextResponse.json({ success: false, error: stderr });
      }

      console.log(`Command stdout: ${stdout}`);

      // Send a success response
      return NextResponse.json({ success: true, stdout });
    });

  } catch (error:any) {
    console.error(`Error processing request: ${error.message}`);
    return NextResponse.json({ success: false, error: error.message });
  }
}
