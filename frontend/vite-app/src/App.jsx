import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard/Dashboard';
import About from './Components/About';
import Chat from './Components/Dashboard/Chat';
import NewsFeed from './Components/Dashboard/CropPrices';
import Weather from './Components/Dashboard/Weather';
import Settings from './Components/Dashboard/Settings';
import Map from './Components/Dashboard/Map';
import Predict from './Components/Dashboard/Predict';
import CropPrices from './Components/Dashboard/CropPrices';
import Reports from './Components/Dashboard/Reports';
import Community from './Components/Dashboard/Community';
import Signup from './Components/Signup';
import Feeds from './Components/Dashboard/Feeds';
import Table from './Components/Dashboard/Table';
import Layout from './Components/Dashboard/Layout';

function App() {
  const user = useSelector(state => state.username);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="chat" element={<Chat />} />
          <Route path="newsfeed" element={<NewsFeed />} />
          <Route path="weather" element={<Weather />} />
          <Route path="settings" element={<Settings />} />
          <Route path="map" element={<Map />} />
          <Route path="predict" element={<Predict />} />
          <Route path="cropprices" element={<CropPrices />} />
          <Route path="reports" element={<Reports />} />
          <Route path="community" element={<Community />} />
          <Route path="feeds" element={<Feeds />} />
          <Route path="table" element={<Table />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
