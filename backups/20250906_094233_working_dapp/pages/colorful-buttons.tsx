export default function ColorfulButtons() {
	return (
		<main className="bg-deep-black" style={{ minHeight: '100vh', padding: '2rem' }}>
			<h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Colorful Buttons</h1>
			<div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
				<button className="btn-airdrop">Airdrop</button>
				<button className="btn-epo">EPO</button>
				<button className="btn-explorer">Explorer</button>
				<button className="btn-whitepaper">Whitepaper</button>
				<button className="btn-success">Success</button>
				<button className="btn-warning">Warning</button>
				<button className="btn-danger">Danger</button>
				<button className="btn-quick-action">Quick Action</button>
			</div>
		</main>
	)
}
