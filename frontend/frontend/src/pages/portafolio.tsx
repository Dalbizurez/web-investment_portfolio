import "../styles/Dashboard.css";
import "../styles/portafolio.css";
import Header from "../components/header_search";
import SideBar from "../components/sidebar";
import Content_portafolio from "../components/content_portafolio";

function Portafolio() {
	return (
		<main className='search-navigation'>
			<SideBar />
			<Header />
			<Content_portafolio />
		</main>
	)
}

export default Portafolio

