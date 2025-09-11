export default function Test() {
	return (
		<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
			<div className="card-brilliant" style={{ padding: '2rem' }}>
				<h1>Tailwind test</h1>
				<p>Buttons below should be colorful:</p>
				<div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
					<button className="btn-airdrop">Airdrop</button>
					<button className="btn-epo">EPO</button>
					<button className="btn-explorer">Explorer</button>
					<button className="btn-whitepaper">Whitepaper</button>
				</div>
			</div>
		</div>
	)
}
