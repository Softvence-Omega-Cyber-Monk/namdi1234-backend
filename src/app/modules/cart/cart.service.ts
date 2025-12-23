import { Cart } from "./cart.model";
import { ICart, ICartItem } from "./cart.interface";
import { Types } from "mongoose";
import { ProductModel } from "../products/product.model";

export const CartService = {
  // Helper to recalculate totals
  _recalculateCart(cart: ICart): void {
    let totalQuantity = 0;
    let totalPrice = 0;
    for (const item of cart.items) {
      totalQuantity += item.quantity;
      totalPrice += item.totalPrice;
    }
    cart.totalQuantity = totalQuantity;
    cart.totalPrice = totalPrice;
  },

  async addToCart(userId: string, productId: string, quantity: number): Promise<ICart> {
    if (quantity < 1) throw new Error("Quantity must be at least 1");

    const product = await ProductModel.findById(productId).select("pricePerUnit");
    if (!product) throw new Error("Product not found");

    const unitPrice = product.pricePerUnit;
    const totalPrice = unitPrice * quantity;

    let cart = await Cart.findOne({ userId: new Types.ObjectId(userId) });

    if (!cart) {
      cart = new Cart({
        userId: new Types.ObjectId(userId),
        items: [],
        totalQuantity: 0,
        totalPrice: 0,
      });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].totalPrice =
        cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].unitPrice;
    } else {
      // Add new item
      cart.items.push({
        productId: new Types.ObjectId(productId) as any,
        quantity,
        unitPrice,
        totalPrice,
      });
    }

    this._recalculateCart(cart);
    return cart.save();
  },

  async updateCartItem(
    userId: string,
    productId: string,
    action: "increment" | "decrement"
  ): Promise<ICart> {
    const cart = await Cart.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart) throw new Error("Cart not found");

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) throw new Error("Product not in cart");

    if (action === "increment") {
      cart.items[itemIndex].quantity += 1;
    } else if (action === "decrement") {
      cart.items[itemIndex].quantity -= 1;
      if (cart.items[itemIndex].quantity <= 0) {
        cart.items.splice(itemIndex, 1); // Remove item if quantity ≤ 0
      } else {
        // Recompute item total
        cart.items[itemIndex].totalPrice =
          cart.items[itemIndex].quantity * cart.items[itemIndex].unitPrice;
      }
    }

    if (action === "increment") {
      cart.items[itemIndex].totalPrice =
        cart.items[itemIndex].quantity * cart.items[itemIndex].unitPrice;
    }

    this._recalculateCart(cart);
    return cart.save();
  },

  async removeFromCart(userId: string, productId: string): Promise<void> {
    const result = await Cart.updateOne(
      { userId: new Types.ObjectId(userId) },
      { $pull: { items: { productId: new Types.ObjectId(productId) } } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Product not found in cart");
    }

    // Recalculate totals after removal
    const updatedCart = await Cart.findOne({ userId: new Types.ObjectId(userId) });
    if (updatedCart) {
      this._recalculateCart(updatedCart);
      await updatedCart.save();
    }
  },

  async getUserCart(userId: string): Promise<ICart | null> {
    return Cart.findOne({ userId: new Types.ObjectId(userId) }).populate("items.productId");
  },
};