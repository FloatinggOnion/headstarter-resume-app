import { MdTipsAndUpdates } from "react-icons/md";
import { SquareLoader } from "react-spinners";
import { FaRegSadTear } from "react-icons/fa";

import MarkdownRenderer from "./ui/markdown-renderer";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import '@react-pdf-viewer/core/lib/styles/index.css';


type Props = {
	file?: File | null;
	message?: string | null;
	onClick: () => void;
};

const Chat = (props: Props) => {

	return (
		<div className="flex py-3 md:gap-12">
			<section className="hidden md:flex flex-col items-center w-[40vw]">
				<h2 className="text-3xl md:text-3xl font-bold tracking-wide h-[10%]">
					OVERVIEW
				</h2>
				<div className="w-full h-[100vh] overflow-hidden bg-slate-50 shadow-resume">
					<Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js">
						<Viewer fileUrl={props.file ? URL.createObjectURL(props.file) : ''} />;
					</Worker>
				</div>
				<button
					className="bg-black text-white px-3 py-2 rounded-full h-[8vh] my-2"
					onClick={props.onClick}
				>
					Upload new file
				</button>
			</section>
			<div className="flex flex-col md:flex-none">
				<button
					className="md:hidden bg-black text-white px-3 text-sm rounded-full h-[8vh] w-[50%] self-center my-2"
					onClick={props.onClick}
				>
					Upload new file
				</button>
				<section className="h-[120vh] w-[90vw] md:w-[40vw] border-2 rounded-xl shadow-inner overflow-y-scroll">
					{props.message ? (
						props.message !== "Error querying" ? (
							<div className="flex flex-col p-12">
								<div className="flex items-center gap-6">
									<MdTipsAndUpdates size={25} />
									<h3 className="text-2xl font-bold">
										Here are some tips!
										<span className="text-xl">✏️</span>
									</h3>
								</div>
								<p>
									<MarkdownRenderer content={props.message} />
								</p>
							</div>
						) : (
							<div className="flex flex-col items-center justify-center p-12 h-screen text-center text-3xl font-semibold text-neutral-700">
								Sorry, no suggestions available at this time{" "}
								<FaRegSadTear size={80} />
							</div>
						)
					) : (
						<div className="flex flex-col items-center justify-center p-12 h-screen text-center text-3xl">
							<SquareLoader color="grey" />
						</div>
					)}
					<footer className="text-neutral-500 bottom-0 text-center">
						&copy; 2024 Resumend. All rights reserved.
					</footer>
				</section>
			</div>
		</div>
	);
};

export default Chat;
