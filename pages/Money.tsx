import React from "react";
import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./footer";
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
	const tbodyRef = React.useRef<HTMLTableElement>(null);

	const FetchMoneyData = async () => {
		try {
			const response = await fetch("/api/moneyDb");
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			// // Sort data by date in descending order
			// data = data.sort((a: MoneyRecord, b: MoneyRecord) => new Date(b.date).getTime() - new Date(a.date).getTime());
			setMoneyData(data);
		} catch (error) {
			console.error("Error fetching money data:", error);
		}
	};

	useEffect(() => {
		FetchMoneyData();
	}, []);

	useEffect(() => {
		// Scroll the tbody to bottom after data is fetched
		if (tbodyRef.current) {
			tbodyRef.current.scrollTop = tbodyRef.current.scrollHeight;
		}
	}, [moneyData]);

	// const displayedData = moneyData.slice(-20);

	return (
		<div>
			<Navbar />
			<div className="container">
				<h1>Money Page</h1>
				<table
					className="money-table" ref={tbodyRef}
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
							<tr className="paid-row">
								<td colSpan={5}> Loading Data... </td>
							</tr>
						) : (
					moneyData.map((record, index) => (
								<tr
									key={index}
									className={record.paid ? "paid-row" : "unpaid-row"}
								>
									<td>
										{new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
									</td>
									<td>{record.name}</td>
									<td>
<Link
	href={
		"https://profile.intra.42.fr/users/" +
		record.intra
	}
>
	{record.intra}
</Link>
									</td>
									<td>{record.amount} Dhs</td>
									<td>{record.paid ? " ✔️ Paid" : ""}</td>
								</tr>
							))
						)}
						<tr style={{ backgroundColor: "var(--bg-primary)" }}>
							<td colSpan={5}> </td>
						</tr>
						<tr style={{ backgroundColor: "var(--bg-secondary)", borderCollapse: "collapse" }}>
							<td colSpan={3}>Total Paid</td>
							<td>{moneyData.reduce((acc, record) => record.paid ? acc + record.amount : acc, 0)} Dhs</td>
							<td></td>
						</tr>
						<tr style={{ backgroundColor: "var(--bg-secondary)" }}>
							<td colSpan={3}>Total Unpaid</td>
							<td>{moneyData.reduce((acc, record) => !record.paid ? acc + record.amount : acc, 0)} Dhs</td>
							<td></td>
						</tr>
						<tr style={{ backgroundColor: "var(--bg-primary)" }}>
							<td colSpan={5}> </td>
						</tr>
						<tr style={{ backgroundColor: "var(--bg-secondary)" }}>
							<td colSpan={3}>Total</td>
							<td>{moneyData.reduce((acc, record) => acc + record.amount, 0)} Dhs</td>
							<td></td>
						</tr>
					</tbody>
				</table>
			</div>
			<Footer />
		</div>
	);
};

export default Money;
