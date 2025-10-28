import { Link } from "react-router-dom";

function SideBar() {
	return (
		<div className="sideBar">
			<Link to="/">
				<img src="/src/assets/icon.png" alt="" className="main-icon" />
			</Link>
			<ul>
				<li>
					<Link to="/homeUser">
						Home
					</Link>
				</li>
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