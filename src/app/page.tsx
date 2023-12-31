'use client';
import { useEffect, useState } from 'react';
import '@/assets/css/main.css';
import { useRouter } from 'next/navigation';

export default function UploadForm() {
	const [file, setFile] = useState<File | null>(null);
	const [isUploaded, setIsUploaded] = useState<Boolean>(false);
	const [loading , setLoading] = useState<Boolean>(false);
    const router = useRouter();

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!file) return;

		try {
			const formData = new FormData();
			formData.append('file', file);

			const res = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			});

			// handle the error
			if (!res.ok) {
				throw new Error(await res.text());
			}

			// Handle successful upload
			setIsUploaded(true);
			console.log('File uploaded successfully');
		} catch (error) {
			// Handle errors here
			console.error(error);
		}
	};

	useEffect(() => {

	}, [isUploaded])


	const hundleClick = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			setLoading(true);
			const res = await fetch('/api/cmd', {
				method: 'POST'
			});

			// handle the error
			if (!res.ok) {
				throw new Error(await res.text());
			}
            
			console.log('command successfully executed');
			setTimeout(() => {
				router.push('/chat');
			}, 20000);

		} catch (error) {
			// Handle errors here
			console.error(error);
			setTimeout(() => {
				router.push('/chat');
			}, 20000);
		}
	}

	return (
		<div className="container-upload" style={{ marginTop: "20px" }}>
			<center>
				<div>
					<p className='upload-title'>START ASKING YOUR DOCUMENT</p>
				</div>
				<div className='mt-4'>
					{
						(!isUploaded) ?
							<form onSubmit={onSubmit} className="form-upload">
								<label className="drop-container" id="dropcontainer">
									<span className="drop-title">Drop files here</span>
									or
									<input
										type="file"
										name="file"
										onChange={(e) => setFile(e.target.files?.[0])}
										required />
								</label>
								<><button className='button-63 m-2' type="submit">Upload</button></>
							</form>
							:
							<button onClick={hundleClick} className='button-63 m-2' >Start Asking</button>
					}
				</div>
				<div className='mt-3'>
					{loading?<p className='upload-title'>Loading Data...</p>:''}
				</div>
			</center>
		</div>
	);
}
