import React, { useEffect } from "react";
import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./footer";
import { TableRowSkeleton } from "../Skeleton";
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

	return (
		<div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
			<Navbar />

			<main className="flex-1 pt-24 pb-8 px-4 md:px-8">
				<div className="max-w-6xl mx-auto">
					<h1 className="text-3xl md:text-4xl font-bold text-center mb-8" style={{ color: 'var(--text-primary)' }}>
						Money Page
					</h1>

					{/* Back Link */}
					<div className="mb-8">
						<Link
							href="/"
							className="inline-flex items-center gap-2 px-4 py-2 bg-ft-primary hover:bg-ft-secondary
														 text-white font-medium rounded transition-all duration-200 transform hover:scale-105"
						>
							← Back to Registration
						</Link>
					</div>

					{isLoading ? (
						<div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="sticky top-0" style={{ backgroundColor: 'var(--bg-secondary)' }}>
										<tr>
											<th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Date</th>
											<th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Name</th>
											<th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Intra Login</th>
											<th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Amount</th>
											<th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Status</th>
										</tr>
									</thead>
									<tbody>
										<TableRowSkeleton columns={5} rows={8} />
									</tbody>
								</table>
							</div>
						</div>
					) : error ? (
						<div className="rounded-lg shadow-md p-6 text-center bg-red-500 text-white">
							<p className="font-medium">Error loading data. Please refresh the page.</p>
						</div>
					) : (
						<div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
							<div className="overflow-x-auto max-h-[600px] overflow-y-auto" ref={tbodyRef}>
								<table className="w-full">
									<thead className="sticky top-0" style={{ backgroundColor: 'var(--bg-secondary)' }}>
										<tr>
											<th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
												Date
											</th>
											<th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
												Name
											</th>
											<th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
												Intra Login
											</th>
											<th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
												Amount
											</th>
											<th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
												Status
											</th>
										</tr>
									</thead>
									<tbody>
										{moneyData.length === 0 ? (
											<tr>
												<td colSpan={5} className="px-4 py-8 text-center" style={{ color: 'var(--text-secondary)' }}>
													No data available
												</td>
											</tr>
										) : (
											moneyData.map((record: MoneyRecord, index: number) => (
												<tr
													key={index}
													className="border-b"
													style={{
														borderColor: 'var(--border-color)',
														backgroundColor: record.paid ? 'var(--paid-bg)' : 'var(--unpaid-bg)'
													}}
												>
													<td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
														{new Date(record.date).toLocaleDateString('en-GB', {
															day: '2-digit',
															month: '2-digit',
															year: 'numeric'
														})}
													</td>
													<td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
														{record.name}
													</td>
													<td className="px-4 py-3">
														<Link
															href={`https://profile.intra.42.fr/users/${record.intra}`}
															target="_blank"
															rel="noopener noreferrer"
															className="text-ft-primary hover:text-ft-secondary underline transition-colors"
														>
															{record.intra}
														</Link>
													</td>
													<td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
														{record.amount} Dhs
													</td>
													<td className="px-4 py-3">
														{record.paid && (
															<span className="text-green-600 font-medium">✔️ Paid</span>
														)}
													</td>
												</tr>
											))
										)}
										{/* Summary Rows */}
										<tr style={{ backgroundColor: 'var(--bg-primary)' }}>
											<td colSpan={5} className="py-2"></td>
										</tr>
										<tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
											<td colSpan={3} className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
												Total Paid
											</td>
											<td className="px-4 py-3 font-bold text-green-600">
												{moneyData.reduce((acc: number, record: MoneyRecord) => record.paid ? acc + record.amount : acc, 0)} Dhs
											</td>
											<td></td>
										</tr>
										<tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
											<td colSpan={3} className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
												Total Unpaid
											</td>
											<td className="px-4 py-3 font-bold text-orange-500">
												{moneyData.reduce((acc: number, record: MoneyRecord) => !record.paid ? acc + record.amount : acc, 0)} Dhs
											</td>
											<td></td>
										</tr>
										<tr style={{ backgroundColor: 'var(--bg-primary)' }}>
											<td colSpan={5} className="py-2"></td>
										</tr>
										<tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
											<td colSpan={3} className="px-4 py-3 font-bold" style={{ color: 'var(--text-primary)' }}>
												Total
											</td>
											<td className="px-4 py-3 font-bold text-ft-primary">
												{moneyData.reduce((acc: number, record: MoneyRecord) => acc + record.amount, 0)} Dhs
											</td>
											<td></td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default Money;
