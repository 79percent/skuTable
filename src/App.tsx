import React, { useEffect, useState } from "react";
import "./App.css";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from './Pages/Home';

type RouterItem = {
	path: string;
	title: string;
	component?: JSX.Element;
};

const router: RouterItem[] = [
	{
		path: "/",
		title: "SkuTable",
		component: <Home />,
	},
];

const App: React.FC = (props) => {
	const location = useLocation();
	const { pathname } = location;

	return (
		<div className="App">
			<Routes>
				{router.map((item) => {
					const { path, component } = item;
					return <Route key={path} path={path} element={component} />;
				})}
			</Routes>
		</div>
	);
};

export default App;
