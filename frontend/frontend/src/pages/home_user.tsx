import Header from "../components/header_search";
import SideBar from "../components/sidebar";
import ContentHome from "../components/content_home";
import "../styles/Dashboard.css";

function HomeUser() {
	return (
		<main className='search-navigation'>
			<SideBar />
			<Header />
			<ContentHome />
		</main>
	);
}

export default HomeUser;