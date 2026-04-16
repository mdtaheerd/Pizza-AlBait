import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";

export default function PizzaAlBait() {
  const [menu] = useState([
    { name: "AlBait Classic Pizza", price: "AED 29", desc: "Cheesy, crispy, and loaded with flavor" },
    { name: "Royal Palace Veg Pizza", price: "AED 32", desc: "Fresh vegetables with Arabian spices" },
    { name: "Spicy Chicken Crown", price: "AED 35", desc: "Grilled chicken with spicy sauce" },
    { name: "Cheese Majesty", price: "AED 27", desc: "Extra cheese, soft crust, royal taste" }
  ]);

  return (
    <div className="min-h-screen bg-yellow-50">
      {/* Hero Section */}
      <div className="bg-red-600 text-white text-center py-16 px-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold"
        >
          Pizza AlBait 🍕
        </motion.h1>
        <p className="mt-4 text-lg">Taste of Royal Arabian Flavor</p>
        <Button className="mt-6 bg-white text-red-600 hover:bg-gray-100">
          Order Now
        </Button>
      </div>

      {/* About */}
      <div className="max-w-4xl mx-auto text-center py-12 px-4">
        <h2 className="text-3xl font-bold mb-4">Welcome to Pizza AlBait</h2>
        <p className="text-gray-600">
          Where traditional Arabian elegance meets modern pizza craftsmanship.
          Fresh ingredients, royal recipes, and unforgettable taste.
        </p>
      </div>

      {/* Menu */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Our Menu</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {menu.map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="rounded-2xl shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <p className="text-gray-600 mt-2">{item.desc}</p>
                  <div className="mt-4 font-bold text-red-600">{item.price}</div>
                  <Button className="mt-4 w-full bg-red-600 hover:bg-red-700">
                    Add to Order
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white text-center py-8">
        <p>© {new Date().getFullYear()} Pizza AlBait. All rights reserved.</p>
        <p className="text-sm mt-2">Royal Taste Delivered Fresh</p>
      </div>
    </div>
  );
}
