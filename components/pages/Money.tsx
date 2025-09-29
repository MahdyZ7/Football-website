import React, { useEffect } from "react";
import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./footer";
import { useMoney } from "../../hooks/useQueries";
import { MoneyRecord } from "../../types/user";


const Money = () => {
	const tbodyRef = React.useRef<HTMLTableElement>(null);
	const { data: moneyData = [], isLoading, error } = useMoney();

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
						{isLoading ? (
							<tr className="paid-row">
								<td colSpan={5}> Loading Data... </td>
							</tr>
						) : error ? (
							<tr className="unpaid-row">
								<td colSpan={5}> Error loading data. Please refresh the page. </td>
							</tr>
						) : moneyData.length === 0 ? (
							<tr className="paid-row">
								<td colSpan={5}> No data available </td>
							</tr>
						) : (
					moneyData.map((record: MoneyRecord, index: number) => (
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
							<td>{moneyData.reduce((acc: number, record: MoneyRecord) => record.paid ? acc + record.amount : acc, 0)} Dhs</td>
							<td></td>
						</tr>
						<tr style={{ backgroundColor: "var(--bg-secondary)" }}>
							<td colSpan={3}>Total Unpaid</td>
							<td>{moneyData.reduce((acc: number, record: MoneyRecord) => !record.paid ? acc + record.amount : acc, 0)} Dhs</td>
							<td></td>
						</tr>
						<tr style={{ backgroundColor: "var(--bg-primary)" }}>
							<td colSpan={5}> </td>
						</tr>
						<tr style={{ backgroundColor: "var(--bg-secondary)" }}>
							<td colSpan={3}>Total</td>
							<td>{moneyData.reduce((acc: number, record: MoneyRecord) => acc + record.amount, 0)} Dhs</td>
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
