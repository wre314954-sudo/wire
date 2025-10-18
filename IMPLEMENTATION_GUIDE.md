# WireBazaar - Supabase Integration Implementation Guide

## Overview
This guide documents the Supabase integration for global data sync across all features of the WireBazaar e-commerce platform.

## Database Schema

### Tables Created
1. **users** - User profiles (linked to auth.users)
2. **products** - Product catalog with global sync
3. **orders** - Customer orders (supports guest and authenticated users)
4. **inquiries** - Product inquiries
5. **owner_credentials** - Admin/owner access control
6. **carts** - User-specific shopping carts

### Initial Data
- 10 products have been seeded into the database
- All products are now globally synced across devices

## Key Features Implemented

### 1. Authentication System
- **File**: `src/context/UserAuthContext.tsx`
- Uses Supabase's built-in auth system
- Methods:
  - `signUp(email, password, fullName)` - Create new account
  - `signIn(email, password)` - Login
  - `logout()` - Sign out
- Automatically syncs user data with cart

### 2. Database Services
- **File**: `src/lib/db-services.ts`
- Comprehensive service layer for all database operations
- Functions include:
  - Product management (get, save, delete)
  - User cart operations (get, save)
  - Order management (save, get, update status)
  - Inquiry management (save, get, update status)
  - User profile operations
  - CSV export functionality

### 3. Cart Storage
- **File**: `src/lib/cart-storage.ts`
- Now supports both localStorage (guest) and Supabase (authenticated)
- Automatically switches based on auth status
- User-specific cart isolation

### 4. Products Management
- **File**: `src/lib/products-data.ts`
- Products now stored in Supabase
- Global sync across all devices
- Owner dashboard can add/edit/delete products

## Required Updates to Complete Integration

### Pages That Need Updating

#### 1. SiteHeader Component
**File**: `src/components/layout/SiteHeader.tsx`

Current: Uses `requestOtp` and `verifyOtp`
Update to:
```typescript
import { AuthDialog } from '@/components/auth/AuthDialog';
// Replace OTP dialog with:
const [authDialogOpen, setAuthDialogOpen] = useState(false);
// In render:
<AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
```

#### 2. Profile Page
**File**: `src/pages/Profile.tsx`

Update to use new user structure:
- Change `user.contact` to `user.email`
- Use `getUserProfile()` from db-services
- Use `saveUserProfile()` for updates

#### 3. Checkout Page
**File**: `src/pages/Checkout.tsx`

Updates needed:
- Replace cart functions with async versions
- Use `saveOrder()` from db-services
- Ensure payment completion redirects properly

#### 4. Cart Page
**File**: `src/pages/Cart.tsx`

Updates needed:
- Make all cart operations async
- Add loading states for cart operations

#### 5. Orders Page
**File**: `src/pages/Orders.tsx`

Updates needed:
- Use `getUserOrders()` from db-services
- Display orders from Supabase

#### 6. Products Page
**File**: `src/pages/Products.tsx`

Updates needed:
- Use `getProducts()` from db-services
- Remove localStorage dependencies

#### 7. Owner Dashboard
**File**: `src/pages/OwnerDashboard.tsx`

Updates needed:
- Use `getAllProducts()`, `saveProduct()`, `deleteProduct()`
- Use `getAllOrders()`, `updateOrderStatus()`
- Use `getAllInquiries()`, `updateInquiryStatus()`
- Add CSV export buttons using `exportDataToCSV()`

#### 8. ProductsManagement Component
**File**: `src/components/dashboard/ProductsManagement.tsx`

Updates needed:
- Use database service functions
- Remove localStorage operations
- Add proper error handling

### Authentication Flow Updates

All files using `useUserAuth()` need to update from:
```typescript
const { user, requestOtp, verifyOtp } = useUserAuth();
```

To:
```typescript
const { user, signIn, signUp, logout, loading } = useUserAuth();
```

## Excel Export Implementation

The `exportDataToCSV()` function in `db-services.ts` can be used to export:
- Products
- Orders
- Inquiries

Usage example for Owner Dashboard:
```typescript
import { exportDataToCSV, getAllOrders, getAllProducts, getAllInquiries } from '@/lib/db-services';

// Export orders
const orders = await getAllOrders();
exportDataToCSV(orders, 'orders');

// Export products
const products = await getAllProducts();
exportDataToCSV(products, 'products');

// Export inquiries
const inquiries = await getAllInquiries();
exportDataToCSV(inquiries, 'inquiries');
```

## Security Features

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:

1. **Products**: Public read, owner-only write
2. **Orders**: User can view own orders, owners see all
3. **Inquiries**: Public insert, owners can view/update
4. **Carts**: User-specific access only
5. **Users**: User can view/update own profile

### Owner Access
- Owner credentials table controls admin access
- Check with `checkIsOwner(userId)` function
- All admin operations require owner verification

## Data Sync Flow

### For Regular Users:
1. Sign up / Sign in
2. Cart automatically syncs to Supabase
3. Orders saved to database
4. Access own orders from any device

### For Owners:
1. Sign in with owner credentials
2. Manage products (globally synced)
3. View all orders
4. View all inquiries
5. Export data to Excel

## Migration Status

### Completed:
- ✅ Database schema created
- ✅ Initial product data seeded
- ✅ Authentication system updated
- ✅ Database service layer created
- ✅ Cart storage with Supabase integration
- ✅ Auth dialog component created

### Pending:
- ⏳ Update all page components to use new auth
- ⏳ Update all components to use async cart functions
- ⏳ Add CSV export buttons to Owner Dashboard
- ⏳ Test complete flow end-to-end
- ⏳ Update inquiry form to use new structure

## Testing Checklist

### Authentication
- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Sign out
- [ ] Profile loading on refresh

### Products
- [ ] View products on Products page
- [ ] Products sync across devices
- [ ] Owner can add/edit/delete products

### Cart
- [ ] Add items to cart (guest)
- [ ] Add items to cart (logged in)
- [ ] Cart persists after login
- [ ] Cart syncs across devices

### Orders
- [ ] Place order as guest
- [ ] Place order as logged-in user
- [ ] View order history
- [ ] Payment completion flow works

### Owner Dashboard
- [ ] View all orders
- [ ] Update order status
- [ ] View all inquiries
- [ ] Manage products
- [ ] Export data to Excel

## Common Issues & Solutions

### Issue: "User not authenticated"
- **Solution**: Ensure user is signed in before accessing protected resources
- Check `isAuthenticated` from `useUserAuth()`

### Issue: Cart not syncing
- **Solution**: Ensure `setCartUserId()` is called after login
- Check UserAuthContext auth state change handler

### Issue: Products not loading
- **Solution**: Verify Supabase configuration in `.env`
- Check console for database errors

### Issue: Owner features not accessible
- **Solution**: Add user to `owner_credentials` table:
```sql
INSERT INTO owner_credentials (user_id) VALUES ('user-id-here');
```

## Environment Variables

Ensure these are set in `.env`:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Next Steps

1. Update SiteHeader to use AuthDialog
2. Update all pages to use new auth context
3. Make all cart operations async
4. Add CSV export to Owner Dashboard
5. Test complete user flow
6. Test owner dashboard features
7. Deploy and verify production functionality

## Support

For issues or questions about the implementation:
1. Check console logs for detailed error messages
2. Verify database policies in Supabase dashboard
3. Ensure all migrations have been applied
4. Check that user has proper permissions

---

**Last Updated**: Implementation in progress
**Status**: Core infrastructure complete, page updates in progress
