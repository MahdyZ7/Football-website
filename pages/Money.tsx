import React from "react";
import Navbar from "./Navbar";
import Footer from "./footer";
import axios from "axios";
import { useEffect, useState } from "react";

interface MoneyRecord {
	date: string;
	name: string;
	intra: string;
	amount: number;
	paid?: boolean;
}

const Money = () => {
	const [moneyData, setMoneyData] = useState<MoneyRecord[]>([]);

	const FetchMoneyData = async () => {
		try {
			const response = await fetch("/api/moneyDb");
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			setMoneyData(data);
		} catch (error) {
			console.error("Error fetching money data:", error);
		}
	};

	useEffect(() => {
		FetchMoneyData();
	}, []);

	return (
		<div>
			<Navbar />
			<div className="container">
				<h1>Money Page</h1>
				<table
					className="money-table"
					style={{ borderCollapse: "collapse", width: "100%" }}
				>
					<thead>
						<tr>
							<th>Date</th>
							<th>Name</th>
							<th>intra login</th>
							<th>Amount</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{moneyData.length === 0 ? (
							<tr style={{ backgroundColor: "#e8f5f9" }}>
								<td colSpan={5}> Loading Data... </td>
							</tr>
						) : (
							moneyData.map((record, index) => (
								<tr
									key={index}
									style={{
										backgroundColor:
											record.paid
												? "#e8f5f9"
												: "#ffe0b080",
									}}
								>
									<td>
										{new Date(
											record.date
										).toLocaleDateString()}
									</td>
									<td>{record.name}</td>
									<td>
										<a
											href={
												"https://profile.intra.42.fr/users/" +
												record.intra
											}
										>
											{record.intra}
										</a>
									</td>
									<td>{record.amount} Dhs</td>
									<td>{record.paid ? " ✔️ Paid" : ""}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
			<Footer />
		</div>
	);
};

export default Money;
