import { Link } from "react-router-dom";

function SideBar() {
	return (
		<div className="sideBar">
			<img src="/src/assets/icon.png" alt="" className="main-icon" />
			<ul>
				<li>Home</li>
				<li>
					<Link to="/transfers">
						Transfers
					</Link>
				</li>
				<li>Search</li>
				<li>Invite</li>

				<li>
					<Link to="/portafolio">
						Portafolio
					</Link>
				</li>
				<li>More</li>
			</ul>
		</div>
	);
}

export default SideBar;