import { Link } from "react-router-dom";

const cityLinks = [
  { label: "Boston, MA", city: "Boston", state: "MA" },
  { label: "Providence, RI", city: "Providence", state: "RI" },
  { label: "Hartford, CT", city: "Hartford", state: "CT" },
  { label: "Manchester, NH", city: "Manchester", state: "NH" },
];

const cityLinks2 = [
  { label: "Portland, ME", city: "Portland", state: "ME" },
  { label: "Burlington, VT", city: "Burlington", state: "VT" },
];

const Footer = () => {
  return (
    <footer className="bg-navy text-popover py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-heading text-xl font-bold mb-4">NeighborSchools</h3>
            <p className="text-sm opacity-70">43 Bromfield St<br />Boston, MA 02108<br />(617) 010-7160</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 opacity-70">Find Daycare</h4>
            <ul className="space-y-2 text-sm opacity-80">
              {cityLinks.map((c) => (
                <li key={c.label}>
                  <Link to={`/search?city=${encodeURIComponent(c.city)}&state=${encodeURIComponent(c.state)}`} className="hover:opacity-100 transition-opacity">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 opacity-70">Find Daycare</h4>
            <ul className="space-y-2 text-sm opacity-80">
              {cityLinks2.map((c) => (
                <li key={c.label}>
                  <Link to={`/search?city=${encodeURIComponent(c.city)}&state=${encodeURIComponent(c.state)}`} className="hover:opacity-100 transition-opacity">
                    {c.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/search" className="hover:opacity-100 transition-opacity">All Daycares</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 opacity-70">Company</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#" className="hover:opacity-100 transition-opacity">About Us</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Blog</a></li>
              <li><Link to="/search" className="hover:opacity-100 transition-opacity">For Providers</Link></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-popover/10 mt-10 pt-6 text-center text-xs opacity-50">
          © {new Date().getFullYear()} NeighborSchools. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
