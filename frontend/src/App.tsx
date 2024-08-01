import { useRef, useState } from "react";

import Navbar from "./components/Navbar";
import Chat from "./components/Chat";
import Logo from "/logo.svg";

import axios from "axios";

import "./App.css";
import { BiSolidCloudUpload } from "react-icons/bi";
import { ClipLoader } from "react-spinners";
import { PiMagicWand } from "react-icons/pi";

function App() {
	const [file, setFile] = useState<File | null>(null);
	const [isUploaded, setIsUploaded] = useState(false);
	const [chatOpen, setChatOpen] = useState(false);
	const [input, setInput] = useState("");
	const [result, setResult] = useState("");
	const [sessionID, setSessionID] = useState("");

	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleDivClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
	};

	const handleSubmit = async (
		e:
			| React.DragEvent<HTMLDivElement>
			| React.ChangeEvent<HTMLInputElement>,
		uploadedFile?: File
	) => {
		e.preventDefault();
		const fileToUpload = uploadedFile || file;
		if (!fileToUpload) return;
		setIsUploaded(false);

		console.log("received file");
		const formData = new FormData();
		formData.append("file", fileToUpload);

		try {
			const res = await axios.post(
				"https://headstarter-resume-app.onrender.com/upload",
				// "http://localhost:8000/upload",
				formData
			);
			setSessionID(res.data.response?.session_id);
			setIsUploaded(true);
			// setChatOpen(true);
		} catch (error) {
			console.error("Error uploading file:", error);
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		const droppedFile = e.dataTransfer.files[0];
		if (droppedFile && droppedFile.type === "application/pdf") {
			setFile(droppedFile);

			handleSubmit(e, droppedFile);
		} else {
			alert("Please upload a PDF file.");
		}
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files && files.length > 0) {
			// Handle the selected file(s) here
			if (files[0].type === "application/pdf") {
				// console.log(files[0]);
				setFile(files[0]);
				console.log("uploading file now");
				handleSubmit(event, files[0]);
			} else {
				alert("Please upload a PDF file.");
			}
		}
	};

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		console.log(event.target.value);
		setInput(event.target.value);
	};

	const handleQuerySubmit = async () => {
		console.log(input);
		console.log("sessionID", sessionID);
		const headers = {
			"X-Session-ID": sessionID,
			"Content-Type": "application/json",
		};
		setChatOpen(true);
		console.log(file)
		try {
			const res = await axios.post(
				"https://headstarter-resume-app.onrender.com/query",
				// "http://localhost:8000/query",
				{
					query: input,
				},
				{
					headers: headers,
					timeout: 20000,
					timeoutErrorMessage: "Request timed out",
				}
			);
			console.log(res?.data?.response?.answer);
			setResult(res?.data?.response?.answer);
		} catch (error) {
			console.error("Error querying:", error);
			setResult("Error querying");
		}
	};

	const handleUploadNewFile = () => {
		setFile(null);
		setIsUploaded(false);
		setChatOpen(false);
		setResult("")
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className="flex flex-col items-center">
			<Navbar className="" />
			{!chatOpen && (
				<div
					className="absolute text-lg md:text-xl font-medium md:left-0 text-neutral-700 my-4 p-2 md:my-8 md:p-4"
					style={{ marginTop: "80px" }}
				>
					<p>Smart Resume Reviews | AI Driven</p>
				</div>
			)}

			{!chatOpen && (
				<main className="relative flex flex-col min-h-screen justify-center gap-6 items-center p-4 md:mt-12">
					<h2 className="text-3xl md:text-3xl font-bold tracking-wide">
						Trying to get a job?
					</h2>
					<div className="flex gap-2 items-center">
						<input
							type="text"
							placeholder="Give a description of your dream job"
							className="w-[70vw] md:w-[60vw] text-center py-2 border-2 rounded-md border-neutral-500 focus:outline-none"
							onChange={handleInputChange}
						/>
						<button
							className="flex gap-2 bg-black w-[20vw] text-white font-semibold text-md py-2 px-12 rounded-md border-2 border-black items-center justify-center"
							onClick={handleQuerySubmit}
						>
							Go
							<PiMagicWand size={20} color="white" />
						</button>
					</div>
					<div className="flex md:text-center justify-between md:justify-center md:gap-5 p-2 items-center">
						<p>
							Get the best version of your resume in minutes with
							our AI resume reviewer
						</p>
						<div className="w-[20%] md:w-[10%] p-2">
							<img
								src={Logo}
								alt="logo"
								className="w-7 h-7 rotate-12"
							/>
						</div>
					</div>
					{!file && (
						<div
							className="bg-[#FFF4F4] p-4 md:p-10 rounded-2xl text-center my-6 border-dashed border-2 border-[#A93030] cursor-pointer"
							onClick={handleDivClick}
							onDragOver={handleDragOver}
							onDrop={handleDrop}
						>
							<p>
								<span>
									Select resume to Upload
									<br />
								</span>{" "}
								or drag and drop file
							</p>
							<div className="flex flex-col items-center my-2">
								<BiSolidCloudUpload className="text-5xl" />
								<button className="upload-button">
									Upload
								</button>
							</div>
							<input
								type="file"
								ref={fileInputRef}
								className="hidden"
								onChange={handleFileChange}
							/>
						</div>
					)}
					{file && (
						<ClipLoader
							loading={!isUploaded}
							size={100}
							aria-label="Loading Spinner"
						/>
					)}
					{file && isUploaded && (
						<p className="bg-[#FFF4F4] text-lg md:text-xl border-2 border-dashed border-[#A93030] p-2 rounded-lg text-center">
							File Uploaded Successfully! <br />
							<span className="text-xs">Worried about your data? <br /> Your resume is deleted 10 minutes after you get your review</span>
						</p>
					)}
				</main>
			)}
			{file && isUploaded && chatOpen && (
				<Chat
					file={file}
					message={result}
					onClick={handleUploadNewFile}
				/>
			)}
		</div>
	);
}

export default App;
