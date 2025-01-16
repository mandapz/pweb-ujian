import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronDown } from 'lucide-react';

const App = () => {
  const [sales, setSales] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    customer_name: '',
    product: '',
    quantity: '',
    sale_date: new Date().toISOString().split('T')[0],
    price: '',
    amount: '',
    status: 'pending'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to format number to IDR
  const formatToRupiah = (number) => {
    if (isNaN(number) || number === '') return '';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  // Function to clean Rupiah format to number
  const cleanRupiahFormat = (rupiahString) => {
    if (typeof rupiahString === 'number') return rupiahString;
    if (!rupiahString) return 0;
    return parseInt(rupiahString.replace(/[^0-9]/g, '')) || 0;
  };

  // Calculate amount based on price and quantity
  const calculateAmount = (price, quantity) => {
    const cleanPrice = cleanRupiahFormat(price);
    const qty = parseInt(quantity) || 0;
    return cleanPrice * qty;
  };

  // Fetch sales data
  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost/api/sales.php');
      const data = await response.json();
      setSales(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // Update amount when price or quantity changes
  useEffect(() => {
    const newAmount = calculateAmount(formData.price, formData.quantity);
    setFormData(prev => ({
      ...prev,
      amount: formatToRupiah(newAmount)
    }));
  }, [formData.price, formData.quantity]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const url = isEditing 
      ? `http://localhost/api/sales.php?id=${editId}`
      : 'http://localhost/api/sales.php';
    
    const method = isEditing ? 'PUT' : 'POST';

    const submitData = {
      ...formData,
      price: cleanRupiahFormat(formData.price),
      amount: cleanRupiahFormat(formData.amount)
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setFormData({
          customer_name: '',
          product: '',
          quantity: '',
          sale_date: new Date().toISOString().split('T')[0],
          price: '',
          amount: '',
          status: 'pending'
        });
        setIsEditing(false);
        setEditId(null);
        setShowForm(false);
        fetchSales();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost/api/sales.php?id=${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchSales();
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle edit
  const handleEdit = (sale) => {
    const formattedPrice = formatToRupiah(sale.price || 0);
    const formattedAmount = formatToRupiah(sale.amount || 0);
    
    setIsEditing(true);
    setEditId(sale.id);
    setFormData({
      ...sale,
      price: formattedPrice,
      amount: formattedAmount,
      sale_date: sale.sale_date
    });
    setShowForm(true);
  };

  // Filter sales based on search term
  const filteredSales = sales.filter(sale => 
    sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle price change
  const handlePriceChange = (e) => {
    const inputValue = e.target.value;
    const numericValue = cleanRupiahFormat(inputValue);
    
    if (!isNaN(numericValue)) {
      setFormData(prev => ({
        ...prev,
        price: formatToRupiah(numericValue)
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient">
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <h1 className="dashboard-title">Sales Force Management</h1>
          <p className="dashboard-subtitle">manage and track your sales data efficiently</p>
        </header>

        {/* Main Content */}
        <main className="dashboard-main">
          {/* Action Bar */}
          <div className="action-bar">
            <div className="search-bar">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (!showForm) {
                  setIsEditing(false);
                  setFormData({
                    customer_name: '',
                    product: '',
                    quantity: '',
                    sale_date: new Date().toISOString().split('T')[0],
                    price: '',
                    amount: '',
                    status: 'pending'
                  });
                }
              }}
              className="add-button"
            >
              {showForm ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              {showForm ? 'Hide Form' : 'Add New Sale'}
            </button>
          </div>

          {/* Form Section */}
          {showForm && (
            <div className="form-container">
              <h2 className="form-title">
                {isEditing ? 'Edit Sale' : 'Add New Sale'}
              </h2>
              <form onSubmit={handleSubmit} className="sale-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Customer Name</label>
                    <input
                      type="text"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Product</label>
                    <input
                      type="text"
                      value={formData.product}
                      onChange={(e) => setFormData({...formData, product: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Sale Date</label>
                    <input
                      type="date"
                      value={formData.sale_date}
                      onChange={(e) => setFormData({...formData, sale_date: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Price (Rp)</label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={handlePriceChange}
                      placeholder="Rp 0"
                      required
                      className="form-input bg-gray-50"
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Amount</label>
                    <input
                      type="text"
                      value={formData.amount}
                      readOnly
                      className="form-input bg-gray-50"
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      style={{
                        width: '100%',
                        paddingRight: '30px',
                        paddingLeft: '10px',
                        backgroundColor: 'white',
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke-width=\'1.5\' stroke=\'currentColor\' class=\'size-6\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'m19.5 8.25-7.5 7.5-7.5-7.5\' /%3E%3C/svg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 15px center',
                        backgroundSize: '20px 20px',
                        appearance: 'none',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        height: '40px',
                      }}
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      required
                      className="form-input"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Processing...' : isEditing ? 'Update Sale' : 'Add Sale'}
                </button>
              </form>
            </div>
          )}

          {/* Sales Table */}
          <div className="table-container">
            {loading && <div className="loading-overlay">Loading...</div>}
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Date</th>
                  <th>Price</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.customer_name}</td>
                    <td>{sale.product}</td>
                    <td>{sale.quantity}</td>
                    <td>{sale.sale_date}</td>
                    <td>{formatToRupiah(sale.price)}</td>
                    <td>{formatToRupiah(sale.amount)}</td>
                    <td>
                      <span className={`status-badge status-${sale.status}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(sale)}
                          className="edit-button"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sale.id)}
                          className="delete-button"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;