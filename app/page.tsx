'use client';

import { useState, useRef, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  url: string;
  aliexpressUrl: string;
  metaUrl: string;
  aliexpressPrice: number;
  rendyolPrice: number;
  potentialPrice: number;
  creativeCount: number;
  imageFile: File | null;
  imagePreview: string;
  notes: string;
  rating: number;
  totalCost: number;
  netProfit: number;
  tried: boolean;
  success?: boolean;
  createdAt: string;
}

type SortOption = 'rating-desc' | 'rating-asc' | 'aliexpressPrice-desc' | 'aliexpressPrice-asc' | 'rendyolPrice-desc' | 'rendyolPrice-asc' | 'totalCost-desc' | 'totalCost-asc' | 'netProfit-desc' | 'netProfit-asc' | 'date-desc' | 'date-asc';

// Resim sıkıştırma fonksiyonu
const compressImage = (imageDataUrl: string, maxWidth: number = 800): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageDataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7)); // JPEG formatında %70 kalite
    };
  });
};

// Link kısaltma fonksiyonu
const truncateUrl = (url: string, maxLength: number = 40) => {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + '...';
};

// Fiyat renklendirme fonksiyonları
const getAliExpressPriceColor = (price: number) => {
  return price > 1000 ? 'text-red-600' : 'text-green-600';
};

const getTrendyolPriceColor = (price: number) => {
  if (price > 1500) return 'text-red-600';
  if (price >= 1000 && price <= 1500) return 'text-yellow-600';
  return 'text-green-600';
};

// Net kar renklendirme fonksiyonunu güncelle
const getNetProfitColor = (profit: number) => {
  if (profit >= 301) return 'text-green-600';
  if (profit >= 250) return 'text-yellow-600';
  if (profit >= 151) return 'text-gray-600';
  return 'text-red-600';
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [formattedDates, setFormattedDates] = useState<{[key: string]: string}>({});
  const [newProduct, setNewProduct] = useState({
    name: '',
    url: '',
    aliexpressUrl: '',
    metaUrl: '',
    aliexpressPrice: '',
    rendyolPrice: '',
    potentialPrice: '',
    creativeCount: '',
    imageFile: null as File | null,
    imagePreview: '',
    notes: '',
    rating: '5',
    totalCost: '',
    tried: false
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sayfa yüklendiğinde localStorage'dan verileri al
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem('products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }
    } catch (error) {
      console.error('Veriler yüklenirken hata oluştu:', error);
      // Hata durumunda localStorage'ı temizle
      localStorage.removeItem('products');
    }
  }, []);

  // Ürünler değiştiğinde localStorage'a kaydet
  useEffect(() => {
    try {
      localStorage.setItem('products', JSON.stringify(products));
    } catch (error) {
      console.error('Veriler kaydedilirken hata oluştu:', error);
      alert('Veriler kaydedilirken bir hata oluştu. Lütfen bazı eski ürünleri silin.');
    }
  }, [products]);

  // Tarihleri formatla
  useEffect(() => {
    const dates: {[key: string]: string} = {};
    products.forEach(product => {
      dates[product.id] = new Date(product.createdAt).toLocaleDateString('tr-TR');
    });
    setFormattedDates(dates);
  }, [products]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          // Resmi sıkıştır
          const compressedImage = await compressImage(reader.result as string);
          setNewProduct({
            ...newProduct,
            imageFile: file,
            imagePreview: compressedImage
          });
        } catch (error) {
          console.error('Resim sıkıştırılırken hata oluştu:', error);
          alert('Resim yüklenirken bir hata oluştu. Lütfen daha küçük bir resim deneyin.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      const updatedProducts = products.map(product => 
        product.id === editingProduct.id ? {
          ...product,
          name: newProduct.name,
          url: newProduct.url,
          aliexpressUrl: newProduct.aliexpressUrl,
          metaUrl: newProduct.metaUrl,
          aliexpressPrice: parseFloat(newProduct.aliexpressPrice),
          rendyolPrice: newProduct.rendyolPrice ? parseFloat(newProduct.rendyolPrice) : 0,
          potentialPrice: parseFloat(newProduct.potentialPrice),
          creativeCount: parseInt(newProduct.creativeCount),
          imageFile: newProduct.imageFile,
          imagePreview: newProduct.imagePreview || product.imagePreview,
          notes: newProduct.notes,
          rating: parseInt(newProduct.rating),
          totalCost: parseFloat(newProduct.totalCost),
          netProfit: parseFloat(newProduct.potentialPrice) - parseFloat(newProduct.aliexpressPrice) - parseFloat(newProduct.totalCost),
          tried: newProduct.tried
        } : product
      );
      setProducts(updatedProducts);
      setEditingProduct(null);
    } else {
      const product: Product = {
        id: Date.now().toString(),
        name: newProduct.name,
        url: newProduct.url,
        aliexpressUrl: newProduct.aliexpressUrl,
        metaUrl: newProduct.metaUrl,
        aliexpressPrice: parseFloat(newProduct.aliexpressPrice),
        rendyolPrice: newProduct.rendyolPrice ? parseFloat(newProduct.rendyolPrice) : 0,
        potentialPrice: parseFloat(newProduct.potentialPrice),
        creativeCount: parseInt(newProduct.creativeCount),
        imageFile: newProduct.imageFile,
        imagePreview: newProduct.imagePreview,
        notes: newProduct.notes,
        rating: parseInt(newProduct.rating),
        totalCost: parseFloat(newProduct.totalCost),
        netProfit: parseFloat(newProduct.potentialPrice) - parseFloat(newProduct.aliexpressPrice) - parseFloat(newProduct.totalCost),
        tried: newProduct.tried,
        createdAt: new Date().toISOString()
      };
      setProducts([...products, product]);
    }
    setNewProduct({
      name: '',
      url: '',
      aliexpressUrl: '',
      metaUrl: '',
      aliexpressPrice: '',
      rendyolPrice: '',
      potentialPrice: '',
      creativeCount: '',
      imageFile: null,
      imagePreview: '',
      notes: '',
      rating: '5',
      totalCost: '',
      tried: false
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      url: product.url,
      aliexpressUrl: product.aliexpressUrl,
      metaUrl: product.metaUrl,
      aliexpressPrice: product.aliexpressPrice.toString(),
      rendyolPrice: product.rendyolPrice.toString(),
      potentialPrice: product.potentialPrice.toString(),
      creativeCount: product.creativeCount.toString(),
      imageFile: product.imageFile,
      imagePreview: product.imagePreview,
      notes: product.notes,
      rating: product.rating.toString(),
      totalCost: product.totalCost.toString(),
      tried: product.tried
    });
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      setProducts(products.filter(product => product.id !== productId));
    }
  };

  const handleTryProduct = (productId: string, success?: boolean) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, tried: success === undefined ? !product.tried : true, success: success }
        : product
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating <= 3) return 'bg-red-500';
    if (rating <= 7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const sortProducts = (products: Product[]): Product[] => {
    return [...products].sort((a, b) => {
      // First, sort by tried status (tried products go to bottom)
      if (a.tried !== b.tried) {
        return a.tried ? 1 : -1;
      }

      // Then apply the selected sort option
      switch (sortOption) {
        case 'rating-desc':
          return b.rating - a.rating;
        case 'rating-asc':
          return a.rating - b.rating;
        case 'aliexpressPrice-desc':
          return b.aliexpressPrice - a.aliexpressPrice;
        case 'aliexpressPrice-asc':
          return a.aliexpressPrice - b.aliexpressPrice;
        case 'rendyolPrice-desc':
          return b.rendyolPrice - a.rendyolPrice;
        case 'rendyolPrice-asc':
          return a.rendyolPrice - b.rendyolPrice;
        case 'totalCost-desc':
          return b.totalCost - a.totalCost;
        case 'totalCost-asc':
          return a.totalCost - b.totalCost;
        case 'netProfit-desc':
          return b.netProfit - a.netProfit;
        case 'netProfit-asc':
          return a.netProfit - b.netProfit;
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Dropshipping Ürün Değerlendirme</h1>
        
        {/* Ürün Ekleme/Düzenleme Formu */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Ürün Adı</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Ürün Görseli</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!editingProduct}
                />
                {newProduct.imagePreview && (
                  <img
                    src={newProduct.imagePreview}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Shopify Linki</label>
              <input
                type="url"
                value={newProduct.url}
                onChange={(e) => setNewProduct({...newProduct, url: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">AliExpress Linki</label>
              <input
                type="url"
                value={newProduct.aliexpressUrl}
                onChange={(e) => setNewProduct({...newProduct, aliexpressUrl: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Meta Kütüphane Linki</label>
              <input
                type="url"
                value={newProduct.metaUrl}
                onChange={(e) => setNewProduct({...newProduct, metaUrl: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">AliExpress Fiyatı (₺)</label>
              <input
                type="number"
                step="0.01"
                value={newProduct.aliexpressPrice}
                onChange={(e) => setNewProduct({...newProduct, aliexpressPrice: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Trendyol Satış Fiyatı (₺)</label>
              <input
                type="number"
                step="0.01"
                value={newProduct.rendyolPrice}
                onChange={(e) => setNewProduct({...newProduct, rendyolPrice: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Potansiyel Satış Fiyatı (₺)</label>
              <input
                type="number"
                step="0.01"
                value={newProduct.potentialPrice}
                onChange={(e) => setNewProduct({...newProduct, potentialPrice: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Reklam Kreatif Sayısı</label>
              <input
                type="number"
                min="0"
                value={newProduct.creativeCount}
                onChange={(e) => setNewProduct({...newProduct, creativeCount: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Diğer Maliyetler (₺)</label>
              <input
                type="number"
                step="0.01"
                value={newProduct.totalCost}
                onChange={(e) => setNewProduct({...newProduct, totalCost: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-black mb-1">Notlar</label>
              <textarea
                value={newProduct.notes}
                onChange={(e) => setNewProduct({...newProduct, notes: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-black mb-1">Ürün Puanı (1-10)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newProduct.rating}
                  onChange={(e) => setNewProduct({...newProduct, rating: e.target.value})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className={`px-3 py-1 rounded-full text-white font-medium ${getRatingColor(parseInt(newProduct.rating))}`}>
                  {newProduct.rating}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {editingProduct ? 'Değişiklikleri Kaydet' : 'Ürün Ekle'}
            </button>
            {editingProduct && (
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setNewProduct({
                    name: '',
                    url: '',
                    aliexpressUrl: '',
                    metaUrl: '',
                    aliexpressPrice: '',
                    rendyolPrice: '',
                    potentialPrice: '',
                    creativeCount: '',
                    imageFile: null,
                    imagePreview: '',
                    notes: '',
                    rating: '5',
                    totalCost: '',
                    tried: false
                  });
                }}
                className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                İptal
              </button>
            )}
          </div>
        </form>

        {/* Ürün Listesi */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Kayıtlı Ürünler</h2>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="rating-desc">Puan (Yüksekten Düşüğe)</option>
              <option value="rating-asc">Puan (Düşükten Yükseğe)</option>
              <option value="aliexpressPrice-desc">AliExpress Fiyatı (Yüksekten Düşüğe)</option>
              <option value="aliexpressPrice-asc">AliExpress Fiyatı (Düşükten Yükseğe)</option>
              <option value="rendyolPrice-desc">Trendyol Fiyatı (Yüksekten Düşüğe)</option>
              <option value="rendyolPrice-asc">Trendyol Fiyatı (Düşükten Yükseğe)</option>
              <option value="totalCost-desc">Diğer Maliyetler (Yüksekten Düşüğe)</option>
              <option value="totalCost-asc">Diğer Maliyetler (Düşükten Yükseğe)</option>
              <option value="netProfit-desc">Net Kar (Yüksekten Düşüğe)</option>
              <option value="netProfit-asc">Net Kar (Düşükten Yükseğe)</option>
              <option value="date-desc">Tarih (Yeniden Eskiye)</option>
              <option value="date-asc">Tarih (Eskiden Yeniye)</option>
            </select>
          </div>
          {sortProducts(products).map((product) => (
            <div 
              key={product.id} 
              className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow relative ${product.tried ? 'opacity-50' : ''}`}
            >
              {product.tried && product.success === false && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-red-600 text-2xl font-bold bg-white bg-opacity-50 px-4 py-2 rounded-lg">BAŞARISIZ</span>
                </div>
              )}
              <div className="flex gap-6">
                <div className="w-48 h-48 flex-shrink-0">
                  <img
                    src={product.imagePreview}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-medium text-gray-800">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      {!product.tried ? (
                        <button
                          onClick={() => handleTryProduct(product.id)}
                          className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
                        >
                          Denendi
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTryProduct(product.id, true)}
                            className={`px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ${
                              product.success === true 
                                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                                : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
                            }`}
                          >
                            Başarılı
                          </button>
                          <button
                            onClick={() => handleTryProduct(product.id, false)}
                            className={`px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ${
                              product.success === false 
                                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                                : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
                            }`}
                          >
                            Başarısız
                          </button>
                          <button
                            onClick={() => handleTryProduct(product.id)}
                            className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
                          >
                            Geri Al
                          </button>
                        </div>
                      )}
                      <span className={`px-3 py-1 rounded-full text-white font-medium ${getRatingColor(product.rating)}`}>
                        {product.rating}/10
                      </span>
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-black">
                        <span className="font-medium">Shopify Linki:</span>{' '}
                        <a href={product.url} 
                           title={product.url}
          target="_blank"
          rel="noopener noreferrer"
                           className="text-blue-600 hover:underline">
                          {truncateUrl(product.url)}
                        </a>
                      </p>
                      <p className="text-sm text-black">
                        <span className="font-medium">AliExpress Linki:</span>{' '}
                        <a href={product.aliexpressUrl} 
                           title={product.aliexpressUrl}
          target="_blank"
          rel="noopener noreferrer"
                           className="text-blue-600 hover:underline">
                          {truncateUrl(product.aliexpressUrl)}
                        </a>
                      </p>
                      <p className="text-sm text-black">
                        <span className="font-medium">Meta Kütüphane Linki:</span>{' '}
                        <a href={product.metaUrl} 
                           title={product.metaUrl}
          target="_blank"
          rel="noopener noreferrer"
                           className="text-blue-600 hover:underline">
                          {truncateUrl(product.metaUrl)}
                        </a>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-black">
                        <span className="font-medium">AliExpress Fiyatı:</span>{' '}
                        <span className={getAliExpressPriceColor(product.aliexpressPrice)}>
                          ₺{product.aliexpressPrice}
                        </span>
                      </p>
                      <p className="text-sm text-black">
                        <span className="font-medium">Trendyol Satış Fiyatı:</span>{' '}
                        <span className={getTrendyolPriceColor(product.rendyolPrice)}>
                          {product.rendyolPrice ? `₺${product.rendyolPrice}` : 'Belirtilmemiş'}
                        </span>
                      </p>
                      <p className="text-sm text-black">
                        <span className="font-medium">Potansiyel Satış Fiyatı:</span> ₺{product.potentialPrice}
                      </p>
                      <p className="text-sm text-black">
                        <span className="font-medium">Diğer Maliyetler:</span> ₺{product.totalCost}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-black">
                      <span className="font-medium">Notlar:</span> {product.notes}
                    </p>
                    <p className="text-sm text-black mt-2">
                      Eklenme Tarihi: {formattedDates[product.id] || ''}
                    </p>
                  </div>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-xl font-bold text-center">
                      <span className="text-gray-700">Net Kar:</span>{' '}
                      <span className={getNetProfitColor(product.netProfit)}>
                        ₺{product.netProfit.toFixed(2)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
    </main>
  );
}
