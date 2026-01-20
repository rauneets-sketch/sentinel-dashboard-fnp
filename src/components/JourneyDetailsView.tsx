import { useState } from "react";
import type React from "react";

interface JourneyStep {
  category?: string;
  action?: string;
  step_name?: string;
  status?: string;
  duration_ms?: number;
  error_message?: string;
  error_type?: string;
}

interface Journey {
  id: number;
  name: string;
  steps: JourneyStep[];
  status?: string;
  passed?: number;
  failed?: number;
  duration?: number;
}

const DESKTOP_JOURNEYS: Journey[] = [
  {
    id: 1,
    name: "Home Page Exploration",
    steps: [
      { category: "User Authentication", action: "Navigate to Login Page" },
      { category: "User Authentication", action: "Navigate to Login Page" },
      { category: "User Authentication", action: "Dismiss Notification Popup" },
      { category: "User Authentication", action: "Click Guest Login" },
      { category: "User Authentication", action: "Email Entry" },
      { category: "Homepage Setup", action: "Clear Cart" },
      { category: "Homepage Setup", action: "Set Delivery Location" },
      { category: "Product Discovery", action: "Navigate to Gift Finder" },
      { category: "Product Selection", action: "Navigate to Carnations" },
      { category: "Product Selection", action: "Navigate to Carnations" },
      { category: "Cart Management", action: "Add Product to Cart" },
      { category: "Payment Process", action: "Proceed to Payment" },
      { category: "Order Completion", action: "PNC Created Successfully" },
    ],
  },
  {
    id: 2,
    name: "Payment Methods Testing",
    steps: [
      { category: "Product Discovery", action: "Navigate to Cakes Section" },
      { category: "Product Selection", action: "Select Cake Product" },
      { category: "Delivery Setup", action: "Select Date & Time Slot" },
      { category: "Payment Process", action: "Proceed to Payment" },
      { category: "Payment Process", action: "Test QR Payment Method" },
      { category: "Payment Process", action: "Test UPI Payment Method" },
      { category: "Payment Process", action: "Test Card Payment Method" },
      { category: "Order Completion", action: "All Payment Methods Tested" },
    ],
  },
  {
    id: 3,
    name: "International Phone Number Change",
    steps: [
      { category: "Profile Management", action: "Navigate to Profile Page" },
      {
        category: "Profile Management",
        action: "Change International Phone Number",
      },
      { category: "Navigation", action: "Return to Homepage" },
      { category: "Product Discovery", action: "Navigate to Wedding Section" },
      { category: "Delivery Setup", action: "Set Wedding Delivery Date" },
      { category: "Address Management", action: "Edit Sender Phone Number" },
      { category: "Payment Process", action: "Proceed and Cancel Payment" },
      { category: "Order Completion", action: "Phone Number Change Completed" },
    ],
  },
  {
    id: 4,
    name: "Reminder and FAQ Testing",
    steps: [
      { category: "Navigation", action: "Navigate to Reminder Section" },
      { category: "Reminder Management", action: "Create New Reminder" },
      { category: "Reminder Management", action: "Schedule Gift" },
      { category: "Navigation", action: "Navigate to FAQ Section" },
      { category: "FAQ Management", action: "Explore FAQ Categories" },
      {
        category: "Order Completion",
        action: "Reminder and FAQ Flow Completed",
      },
    ],
  },
  {
    id: 5,
    name: "International Purchase",
    steps: [
      { category: "Navigation", action: "Navigate to International Section" },
      { category: "Location Setup", action: "Select UAE as Destination" },
      {
        category: "Location Setup",
        action: "Set International Delivery Location",
      },
      { category: "Product Selection", action: "Select International Product" },
      { category: "Delivery Setup", action: "Set International Delivery Date" },
      {
        category: "Cart Management",
        action: "Add International Product to Cart",
      },
      { category: "Payment Process", action: "Test International Payment" },
      {
        category: "Order Completion",
        action: "International Purchase Completed",
      },
    ],
  },
  {
    id: 7,
    name: "Combinational Purchase",
    steps: [
      { category: "User Authentication", action: "Navigate to Login Page" },
      {
        category: "Product Selection",
        action: "Navigate to Anniversary Product",
      },
      { category: "Product Selection", action: "Select Domestic Product" },
      { category: "Delivery Setup", action: "Set Domestic Delivery Date" },
      { category: "Cart Management", action: "Add Domestic Product to Cart" },
      { category: "Navigation", action: "Navigate to International Section" },
      { category: "Location Setup", action: "Select USA as Destination" },
      {
        category: "Product Selection",
        action: "Navigate to International Section",
      },
      {
        category: "Product Selection",
        action: "Select International Anniversary Product",
      },
      { category: "Delivery Setup", action: "Set International Delivery Date" },
      {
        category: "Cart Management",
        action: "Add International Product and Checkout",
      },
      { category: "Payment Process", action: "Test Combinational Payment" },
      {
        category: "Order Completion",
        action: "Combinational Purchase Completed",
      },
    ],
  },
  {
    id: 9,
    name: "Cake Variant Testing",
    steps: [
      { category: "User Authentication", action: "Navigate to Login Page" },
      {
        category: "Navigation",
        action: "Navigate to Fudge Brownie Cake Product",
      },
      { category: "Delivery Setup", action: "Set Cake Variant Delivery Date" },
      { category: "Variant Testing", action: "Change the Cake Variant" },
      { category: "Payment Process", action: "Proceed to Payment" },
      {
        category: "Payment Process",
        action: "Test QR Payment for Cake Variant",
      },
      {
        category: "Order Completion",
        action: "Cake Variant Testing Completed",
      },
    ],
  },
  {
    id: 10,
    name: "Coupon Testing (Invalid & Valid)",
    steps: [
      { category: "User Authentication", action: "Navigate to Login Page" },
      {
        category: "Navigation",
        action: "Navigate to Chocolate Truffle Cake Product",
      },
      { category: "Cart Management", action: "Add Product to Cart" },
      {
        category: "Coupon Testing",
        action: "Apply Invalid Coupon Code (INVALID10)",
      },
      {
        category: "Coupon Testing",
        action: "Apply Valid Coupon Code (GIFT10)",
      },
      { category: "Payment Process", action: "Proceed to Payment" },
      { category: "Payment Process", action: "Test QR Payment Method" },
      { category: "Order Completion", action: "Coupon Testing Completed" },
      { category: "Navigation", action: "Return to Homepage" },
    ],
  },
  {
    id: 11,
    name: "Personalized Product Purchase",
    steps: [
      {
        category: "Navigation",
        action: "Navigate to Personalized Water Bottle",
      },
      { category: "Personalization", action: "Add Custom Text 'ASTHA SINGH'" },
      {
        category: "Cart Management",
        action: "Add Personalized Product to Cart",
      },
      { category: "Payment Process", action: "Proceed to Payment Page" },
      { category: "Payment Process", action: "Test QR Payment Method" },
      { category: "Navigation", action: "Navigate Back to Homepage" },
      {
        category: "Order Completion",
        action: "Personalized Purchase Completed",
      },
    ],
  },
  {
    id: 12,
    name: "Message Card Integration",
    steps: [
      { category: "Navigation", action: "Navigate to Celebration Bento Cake" },
      { category: "Delivery Setup", action: "Set Delivery Date and Time" },
      {
        category: "Message Card",
        action: "Add Free Message Card with Custom Text",
      },
      { category: "Payment Process", action: "Proceed to Payment Page" },
      { category: "Payment Process", action: "Test QR Payment Method" },
      { category: "Navigation", action: "Return to Homepage" },
      {
        category: "Order Completion",
        action: "Message Card Purchase Completed",
      },
    ],
  },
  {
    id: 13,
    name: "Product Exploration Journey",
    steps: [
      {
        category: "Product Navigation",
        action: "Navigate to Exotic Blue Orchid",
      },
      { category: "Photo Gallery", action: "Open Main Product Image" },
      {
        category: "Product Details",
        action: "Check Description & Instructions",
      },
      { category: "Journey Step", action: "Navigate Back To FNP Homepage" },
      { category: "Order Completion", action: "Product Exploration Completed" },
    ],
  },
  {
    id: 14,
    name: "Same SKU Product Exploration",
    steps: [
      {
        category: "Product Navigation",
        action: "Navigate to Jade Plant Product",
      },
      {
        category: "Delivery Setup",
        action: "Set Courier Delivery Date & Time Slot",
      },
      { category: "Cart Management", action: "Add Product to Cart (Courier)" },
      { category: "Journey Step", action: "Navigate Back To FNP Homepage" },
      {
        category: "Order Completion",
        action: "Same SKU Exploration Completed",
      },
    ],
  },
  {
    id: 15,
    name: "Search Based Purchase",
    steps: [
      {
        category: "Search Function",
        action: "Search for 'cake' in Search Bar",
      },
      { category: "Delivery Setup", action: "Set Delivery Date & Time Slot" },
      { category: "Cart Management", action: "Add Search Product to Cart" },
      { category: "Payment Process", action: "Test QR Payment Method" },
      {
        category: "Order Completion",
        action: "Search Based Purchase Completed",
      },
    ],
  },
  {
    id: 16,
    name: "Personalized Product with Photo Upload",
    steps: [
      {
        category: "Navigation",
        action: "Navigate to Personalized Cushion Product",
      },
      {
        category: "Photo Upload",
        action: "Upload Custom Photo from Local Path",
      },
      {
        category: "Cart Management",
        action: "Add Personalized Product to Cart",
      },
      { category: "Payment Process", action: "Test QR Payment Method" },
      { category: "Navigation", action: "Navigate Back to Homepage" },
      { category: "Navigation", action: "Navigate to Fridge Magnet Product" },
      {
        category: "Delivery Setup",
        action: "Set Delivery Date (15th) & Time Slot (8-9 AM)",
      },
      {
        category: "Photo Upload",
        action: "Upload 4 Custom Photos (photo1-4.jpg)",
      },
      { category: "Cart Management", action: "Add Fridge Magnet to Cart" },
      { category: "Payment Process", action: "Test QR Payment Method" },
      {
        category: "Order Completion",
        action: "Multi-Photo Upload Journey Completed",
      },
    ],
  },
  {
    id: 17,
    name: "Location Testing",
    steps: [
      {
        category: "Navigation",
        action: "Navigate to Homepage for Location Journey",
      },
      { category: "Location Change", action: "Select New Pincode Gurgaon" },
      { category: "Location Change", action: "Select Delhi Location" },
      {
        category: "Navigation",
        action: "Navigate to PLP and Select Existing Bangalore Pincode",
      },
      { category: "Location Change", action: "Select Gorakhpur Pincode" },
      {
        category: "Location Change",
        action: "Select Final Bangalore Location",
      },
      {
        category: "Navigation",
        action: "Return to Homepage After Location Testing",
      },
      { category: "Order Completion", action: "Location Testing Completed" },
      {
        category: "Navigation",
        action: "Navigate to Homepage for Icon Exploration",
      },
    ],
  },
  {
    id: 18,
    name: "Spherical Home Page Icon Exploration",
    steps: [
      { category: "Category Navigation", action: "Explore Spherical Icons" },
      {
        category: "Order Completion",
        action: "Spherical Icon Exploration Completed",
      },
    ],
  },
  {
    id: 20,
    name: "Gmail OTP Login",
    steps: [
      { category: "Gmail OTP Journey", action: "Navigate to Login Page" },
      { category: "Gmail OTP Journey", action: "Logout If Already Logged In" },
      { category: "Gmail OTP Journey", action: "Open Account Drawer" },
      { category: "Gmail OTP Journey", action: "Perform Gmail OTP Login" },
      { category: "Gmail OTP Journey", action: "Verify Login Success" },
      {
        category: "Order Completion",
        action: "All Journeys Completed Successfully",
      },
    ],
  },
];

const MOBILE_JOURNEYS: Journey[] = [
  {
    id: 1,
    name: "Mobile Home Page Exploration",
    steps: [
      { category: "User Authentication", action: "Navigate to Mobile Login" },
      {
        category: "User Authentication",
        action: "Dismiss Mobile Notification",
      },
      { category: "User Authentication", action: "Click Mobile Guest Login" },
      { category: "Homepage Setup", action: "Set Mobile Delivery Location" },
      {
        category: "Product Discovery",
        action: "Navigate to Gift Finder Mobile",
      },
      { category: "Product Selection", action: "Select Product on Mobile" },
      { category: "Cart Management", action: "Add Product to Mobile Cart" },
      { category: "Payment Process", action: "Mobile Payment Processing" },
      { category: "Order Completion", action: "Mobile Order Confirmed" },
    ],
  },
  {
    id: 2,
    name: "Mobile Payment Methods",
    steps: [
      { category: "Product Discovery", action: "Browse Cakes on Mobile" },
      { category: "Product Selection", action: "Select Cake Product Mobile" },
      { category: "Delivery Setup", action: "Set Mobile Delivery Date" },
      { category: "Payment Process", action: "Mobile QR Payment" },
      { category: "Payment Process", action: "Mobile UPI Payment" },
      { category: "Payment Process", action: "Mobile Card Payment" },
      { category: "Order Completion", action: "Mobile Payment Methods Tested" },
    ],
  },
  {
    id: 3,
    name: "Mobile Search Purchase",
    steps: [
      { category: "Search Function", action: "Mobile Search Bar" },
      { category: "Product Selection", action: "Select from Search Results" },
      { category: "Delivery Setup", action: "Set Mobile Delivery Slot" },
      { category: "Cart Management", action: "Add to Mobile Cart" },
      { category: "Payment Process", action: "Mobile Payment" },
      {
        category: "Order Completion",
        action: "Mobile Search Purchase Complete",
      },
    ],
  },
  {
    id: 4,
    name: "Mobile Personalized Product",
    steps: [
      { category: "Navigation", action: "Navigate to Personalized Products" },
      { category: "Personalization", action: "Add Custom Text Mobile" },
      { category: "Cart Management", action: "Add Personalized to Cart" },
      { category: "Payment Process", action: "Mobile Payment" },
      { category: "Order Completion", action: "Mobile Personalized Purchase" },
    ],
  },
  {
    id: 5,
    name: "Mobile International Purchase",
    steps: [
      { category: "Navigation", action: "Navigate to International Section" },
      {
        category: "Location Setup",
        action: "Select International Destination",
      },
      { category: "Product Selection", action: "Select International Product" },
      { category: "Delivery Setup", action: "Set International Delivery" },
      { category: "Payment Process", action: "International Mobile Payment" },
      { category: "Order Completion", action: "Mobile International Purchase" },
    ],
  },
  {
    id: 6,
    name: "Mobile Location Testing",
    steps: [
      { category: "Location Change", action: "Change Mobile Pincode" },
      { category: "Location Change", action: "Select New Location" },
      { category: "Navigation", action: "Browse Products by Location" },
      { category: "Location Change", action: "Switch Location Again" },
      {
        category: "Order Completion",
        action: "Mobile Location Testing Complete",
      },
    ],
  },
  {
    id: 7,
    name: "Mobile Message Card",
    steps: [
      { category: "Navigation", action: "Navigate to Product" },
      { category: "Delivery Setup", action: "Set Delivery Date" },
      { category: "Message Card", action: "Add Message Card Mobile" },
      { category: "Payment Process", action: "Mobile Payment" },
      { category: "Order Completion", action: "Mobile Message Card Purchase" },
    ],
  },
  {
    id: 8,
    name: "Mobile Photo Upload",
    steps: [
      { category: "Navigation", action: "Navigate to Personalized Product" },
      { category: "Photo Upload", action: "Upload Photo from Mobile" },
      { category: "Cart Management", action: "Add to Cart" },
      { category: "Payment Process", action: "Mobile Payment" },
      { category: "Order Completion", action: "Mobile Photo Upload Complete" },
    ],
  },
  {
    id: 9,
    name: "Mobile Coupon Testing",
    steps: [
      { category: "Product Selection", action: "Select Product" },
      { category: "Cart Management", action: "Add to Cart" },
      { category: "Coupon Testing", action: "Apply Coupon Code" },
      { category: "Payment Process", action: "Mobile Payment" },
      {
        category: "Order Completion",
        action: "Mobile Coupon Testing Complete",
      },
    ],
  },
  {
    id: 10,
    name: "Mobile Profile Management",
    steps: [
      { category: "Profile Management", action: "Navigate to Profile" },
      { category: "Profile Management", action: "Update Phone Number" },
      { category: "Navigation", action: "Return to Homepage" },
      { category: "Product Discovery", action: "Browse Products" },
      {
        category: "Order Completion",
        action: "Mobile Profile Update Complete",
      },
    ],
  },
];

const OMS_JOURNEYS: Journey[] = [
  {
    id: 1,
    name: "OMS Order Creation",
    steps: [
      { category: "Order Management", action: "Navigate to OMS Dashboard" },
      { category: "Order Management", action: "Create New Order" },
      { category: "Customer Details", action: "Enter Customer Information" },
      { category: "Product Selection", action: "Select Products" },
      { category: "Delivery Setup", action: "Set Delivery Details" },
      { category: "Order Completion", action: "Order Created Successfully" },
    ],
  },
  {
    id: 2,
    name: "OMS Order Tracking",
    steps: [
      { category: "Order Management", action: "Navigate to Orders List" },
      { category: "Order Tracking", action: "Search Order by ID" },
      { category: "Order Tracking", action: "View Order Status" },
      { category: "Order Tracking", action: "Track Delivery" },
      { category: "Order Completion", action: "Order Tracking Complete" },
    ],
  },
  {
    id: 3,
    name: "OMS Payment Processing",
    steps: [
      { category: "Order Management", action: "Navigate to Pending Orders" },
      { category: "Payment Process", action: "Process Payment" },
      { category: "Payment Process", action: "Verify Payment Status" },
      { category: "Order Management", action: "Update Order Status" },
      { category: "Order Completion", action: "Payment Processing Complete" },
    ],
  },
  {
    id: 4,
    name: "OMS Inventory Management",
    steps: [
      { category: "Inventory", action: "Navigate to Inventory" },
      { category: "Inventory", action: "Check Stock Levels" },
      { category: "Inventory", action: "Update Product Stock" },
      { category: "Inventory", action: "View Stock History" },
      { category: "Order Completion", action: "Inventory Management Complete" },
    ],
  },
  {
    id: 5,
    name: "OMS Refund Processing",
    steps: [
      { category: "Order Management", action: "Navigate to Orders" },
      { category: "Refund Management", action: "Select Order for Refund" },
      { category: "Refund Management", action: "Process Refund" },
      { category: "Refund Management", action: "Verify Refund Status" },
      { category: "Order Completion", action: "Refund Processing Complete" },
    ],
  },
  {
    id: 6,
    name: "OMS Report Generation",
    steps: [
      { category: "Reporting", action: "Navigate to Reports" },
      { category: "Reporting", action: "Select Report Type" },
      { category: "Reporting", action: "Set Date Range" },
      { category: "Reporting", action: "Generate Report" },
      { category: "Reporting", action: "Download Report" },
      { category: "Order Completion", action: "Report Generation Complete" },
    ],
  },
  {
    id: 7,
    name: "OMS Bulk Order Upload",
    steps: [
      { category: "Order Management", action: "Navigate to Bulk Upload" },
      { category: "Order Management", action: "Select CSV File" },
      { category: "Order Management", action: "Validate Orders" },
      { category: "Order Management", action: "Upload Orders" },
      { category: "Order Completion", action: "Bulk Upload Complete" },
    ],
  },
  {
    id: 8,
    name: "OMS Customer Management",
    steps: [
      { category: "Customer Management", action: "Navigate to Customers" },
      { category: "Customer Management", action: "Search Customer" },
      { category: "Customer Management", action: "View Customer Details" },
      { category: "Customer Management", action: "Update Customer Info" },
      { category: "Order Completion", action: "Customer Management Complete" },
    ],
  },
  {
    id: 9,
    name: "OMS Delivery Assignment",
    steps: [
      { category: "Delivery Management", action: "Navigate to Deliveries" },
      { category: "Delivery Management", action: "View Pending Deliveries" },
      { category: "Delivery Management", action: "Assign Delivery Partner" },
      { category: "Delivery Management", action: "Update Delivery Status" },
      { category: "Order Completion", action: "Delivery Assignment Complete" },
    ],
  },
  {
    id: 10,
    name: "OMS Return Management",
    steps: [
      { category: "Return Management", action: "Navigate to Returns" },
      { category: "Return Management", action: "Create Return Request" },
      { category: "Return Management", action: "Verify Return Items" },
      { category: "Return Management", action: "Process Return" },
      { category: "Order Completion", action: "Return Management Complete" },
    ],
  },
];

const PARTNER_PANEL_JOURNEYS: Journey[] = [
  {
    id: 1,
    name: "Partner Dashboard Overview",
    steps: [
      { category: "Dashboard", action: "Navigate to Partner Dashboard" },
      { category: "Dashboard", action: "View Sales Summary" },
      { category: "Dashboard", action: "Check Performance Metrics" },
      { category: "Dashboard", action: "View Recent Orders" },
      { category: "Order Completion", action: "Dashboard Overview Complete" },
    ],
  },
  {
    id: 2,
    name: "Partner Order Management",
    steps: [
      { category: "Order Management", action: "Navigate to Orders" },
      { category: "Order Management", action: "View All Orders" },
      { category: "Order Management", action: "Filter Orders by Status" },
      { category: "Order Management", action: "View Order Details" },
      { category: "Order Completion", action: "Order Management Complete" },
    ],
  },
  {
    id: 3,
    name: "Partner Inventory Sync",
    steps: [
      { category: "Inventory", action: "Navigate to Inventory" },
      { category: "Inventory", action: "Sync Product Inventory" },
      { category: "Inventory", action: "Update Stock Levels" },
      { category: "Inventory", action: "View Inventory History" },
      { category: "Order Completion", action: "Inventory Sync Complete" },
    ],
  },
  {
    id: 4,
    name: "Partner Payment Settlement",
    steps: [
      { category: "Payment", action: "Navigate to Payments" },
      { category: "Payment", action: "View Payment History" },
      { category: "Payment", action: "Check Settlement Status" },
      { category: "Payment", action: "Download Payment Report" },
      { category: "Order Completion", action: "Payment Settlement Complete" },
    ],
  },
  {
    id: 5,
    name: "Partner Product Listing",
    steps: [
      { category: "Product Management", action: "Navigate to Products" },
      { category: "Product Management", action: "Add New Product" },
      { category: "Product Management", action: "Edit Product Details" },
      { category: "Product Management", action: "Upload Product Images" },
      { category: "Order Completion", action: "Product Listing Complete" },
    ],
  },
  {
    id: 6,
    name: "Partner Performance Analytics",
    steps: [
      { category: "Analytics", action: "Navigate to Analytics" },
      { category: "Analytics", action: "View Sales Trends" },
      { category: "Analytics", action: "Check Customer Ratings" },
      { category: "Analytics", action: "Download Analytics Report" },
      { category: "Order Completion", action: "Analytics Review Complete" },
    ],
  },
  {
    id: 7,
    name: "Partner Promotion Management",
    steps: [
      { category: "Promotions", action: "Navigate to Promotions" },
      { category: "Promotions", action: "Create New Promotion" },
      { category: "Promotions", action: "Set Discount Rules" },
      { category: "Promotions", action: "Activate Promotion" },
      { category: "Order Completion", action: "Promotion Management Complete" },
    ],
  },
  {
    id: 8,
    name: "Partner Customer Support",
    steps: [
      { category: "Support", action: "Navigate to Support Tickets" },
      { category: "Support", action: "View Customer Queries" },
      { category: "Support", action: "Respond to Tickets" },
      { category: "Support", action: "Close Resolved Tickets" },
      { category: "Order Completion", action: "Customer Support Complete" },
    ],
  },
  {
    id: 9,
    name: "Partner Compliance Check",
    steps: [
      { category: "Compliance", action: "Navigate to Compliance" },
      { category: "Compliance", action: "Review Compliance Status" },
      { category: "Compliance", action: "Update Documentation" },
      { category: "Compliance", action: "Submit for Verification" },
      { category: "Order Completion", action: "Compliance Check Complete" },
    ],
  },
  {
    id: 10,
    name: "Partner Account Settings",
    steps: [
      { category: "Account", action: "Navigate to Account Settings" },
      { category: "Account", action: "Update Profile Information" },
      { category: "Account", action: "Change Password" },
      { category: "Account", action: "Configure Notifications" },
      { category: "Order Completion", action: "Account Settings Updated" },
    ],
  },
];

const JOURNEYS_DATA: Journey[] = DESKTOP_JOURNEYS;

interface JourneyDetailsViewProps {
  platform?: string;
  testData?: any; // Real test data from Supabase
}

type PlatformType = "desktop" | "mobile" | "oms" | "partner";

export function JourneyDetailsView({
  platform,
  testData,
}: JourneyDetailsViewProps) {
  const [selectedPlatform, setSelectedPlatform] =
    useState<PlatformType>("desktop");
  const [expandedJourney, setExpandedJourney] = useState<number | null>(null);

  const toggleJourney = (journeyId: number) => {
    setExpandedJourney(expandedJourney === journeyId ? null : journeyId);
  };

  const getJourneyData = (plat: PlatformType): Journey[] => {
    // Use real data from Supabase if available, otherwise fall back to mock data
    if (testData && testData[plat] && testData[plat].modules) {
      return testData[plat].modules.map((module: any, index: number) => ({
        id: index + 1,
        name: module.name || `Journey ${index + 1}`,
        status: module.status || (module.failed > 0 ? "FAILED" : "PASSED"),
        passed: module.passed || 0,
        failed: module.failed || 0,
        duration: module.duration || 0,
        steps: module.steps || [],
      }));
    }

    // Fallback to mock data
    switch (plat) {
      case "mobile":
        return MOBILE_JOURNEYS;
      case "oms":
        return OMS_JOURNEYS;
      case "partner":
        return PARTNER_PANEL_JOURNEYS;
      default:
        return DESKTOP_JOURNEYS;
    }
  };

  const getPlatformLabel = (plat: PlatformType): string => {
    switch (plat) {
      case "mobile":
        return "Mobile Site";
      case "oms":
        return "OMS";
      case "partner":
        return "Partner Panel";
      default:
        return "Desktop Site";
    }
  };

  const journeys = getJourneyData(selectedPlatform);
  const platformLabel = getPlatformLabel(selectedPlatform);

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      "User Authentication": "#FF6B6B",
      "Homepage Setup": "#4ECDC4",
      "Product Discovery": "#45B7D1",
      "Product Selection": "#96CEB4",
      "Cart Management": "#FFEAA7",
      "Payment Process": "#DDA15E",
      "Order Completion": "#10B981",
      "Profile Management": "#8E44AD",
      Navigation: "#3498DB",
      "Delivery Setup": "#E74C3C",
      "Address Management": "#F39C12",
      "Reminder Management": "#9B59B6",
      "FAQ Management": "#1ABC9C",
      "Location Setup": "#E67E22",
      "Variant Testing": "#C0392B",
      "Coupon Testing": "#16A085",
      Personalization: "#8E44AD",
      "Message Card": "#D35400",
      "Product Navigation": "#2980B9",
      "Photo Gallery": "#27AE60",
      "Product Details": "#2C3E50",
      "Journey Step": "#34495E",
      "Search Function": "#7F8C8D",
      "Photo Upload": "#16A085",
      "Location Change": "#E67E22",
      "Category Navigation": "#8E44AD",
      "Gmail OTP Journey": "#EA4335",
      "Order Management": "#3498DB",
      "Customer Details": "#9B59B6",
      "Order Tracking": "#1ABC9C",
      Inventory: "#E67E22",
      "Refund Management": "#E74C3C",
      Reporting: "#27AE60",
      "Customer Management": "#F39C12",
      "Delivery Management": "#16A085",
      "Return Management": "#8E44AD",
      Dashboard: "#3498DB",
      "Product Management": "#E67E22",
      Analytics: "#9B59B6",
      Promotions: "#1ABC9C",
      Support: "#27AE60",
      Compliance: "#F39C12",
      Account: "#16A085",
    };
    return colors[category] || "#95A5A6";
  };

  return (
    <div className="journey-details-container">
      <div className="journey-header">
        <h2>
          <i className="fas fa-map-location-dot" /> Journey Details
        </h2>
      </div>

      <div className="tabs">
        <button
          className={`tab ${selectedPlatform === "desktop" ? "active" : ""}`}
          onClick={() => {
            setSelectedPlatform("desktop");
            setExpandedJourney(null);
          }}
        >
          <i className="fas fa-laptop-code" /> Desktop Site
        </button>
        <button
          className={`tab ${selectedPlatform === "mobile" ? "active" : ""}`}
          onClick={() => {
            setSelectedPlatform("mobile");
            setExpandedJourney(null);
          }}
        >
          <i className="fas fa-mobile-screen" /> Mobile Site
        </button>
        <button
          className={`tab ${selectedPlatform === "oms" ? "active" : ""}`}
          onClick={() => {
            setSelectedPlatform("oms");
            setExpandedJourney(null);
          }}
        >
          <i className="fas fa-boxes-stacked" /> OMS
        </button>
        <button
          className={`tab ${selectedPlatform === "partner" ? "active" : ""}`}
          onClick={() => {
            setSelectedPlatform("partner");
            setExpandedJourney(null);
          }}
        >
          <i className="fas fa-handshake" /> Partner Panel
        </button>
        <button className="tab coming-soon" disabled title="Coming Soon">
          <i className="fab fa-android" /> Android
        </button>
      </div>

      <div className="journey-platform-info">
        <p className="journey-subtitle">
          {platformLabel} - Total Journeys: <strong>{journeys.length}</strong>
        </p>
      </div>

      <div className="journeys-list">
        {journeys.map((journey) => (
          <div key={journey.id} className="journey-item">
            <div
              className="journey-header-row"
              onClick={() => toggleJourney(journey.id)}
            >
              <div className="journey-title-section">
                <span className="journey-toggle-icon">
                  <i
                    className={`fas fa-chevron-${
                      expandedJourney === journey.id ? "down" : "right"
                    }`}
                  />
                </span>
                <span className="journey-full-title">
                  Journey {journey.id} - {journey.name}
                </span>
                {journey.status && (
                  <span
                    className={`journey-status ${journey.status.toLowerCase()}`}
                  >
                    {journey.status === "FAILED" ? "❌" : "✅"} {journey.status}
                  </span>
                )}
              </div>
              <div className="journey-meta">
                {journey.passed !== undefined &&
                  journey.failed !== undefined && (
                    <span className="journey-stats">
                      <span className="passed-count">✅ {journey.passed}</span>
                      <span className="failed-count">❌ {journey.failed}</span>
                    </span>
                  )}
                {journey.duration && (
                  <span className="journey-duration">
                    <i className="fas fa-clock" />{" "}
                    {(journey.duration / 1000).toFixed(1)}s
                  </span>
                )}
                <span className="step-count">
                  <i className="fas fa-list-check" /> {journey.steps.length}{" "}
                  steps
                </span>
              </div>
            </div>

            {expandedJourney === journey.id && (
              <div className="journey-steps">
                <div className="steps-timeline">
                  {journey.steps.map((step, index) => {
                    // Handle both mock data (category/action) and real data (step_name/status)
                    const stepName =
                      step.step_name || step.action || `Step ${index + 1}`;
                    const stepCategory = step.category || "General";
                    const stepStatus = step.status;
                    const stepDuration = step.duration_ms;
                    const stepError = step.error_message;

                    return (
                      <div
                        key={index}
                        className={`step-item ${stepStatus ? stepStatus.toLowerCase() : ""}`}
                      >
                        <div className="step-number">
                          {index + 1}
                          {stepStatus && (
                            <span
                              className={`step-status-icon ${stepStatus.toLowerCase()}`}
                            >
                              {stepStatus === "FAILED"
                                ? "❌"
                                : stepStatus === "PASSED"
                                  ? "✅"
                                  : "⏸️"}
                            </span>
                          )}
                        </div>
                        <div className="step-content">
                          <div className="step-category">
                            <span
                              className="category-badge"
                              style={{
                                backgroundColor: getCategoryColor(stepCategory),
                              }}
                            >
                              {stepCategory}
                            </span>
                            {stepStatus && (
                              <span
                                className={`status-badge ${stepStatus.toLowerCase()}`}
                              >
                                {stepStatus}
                              </span>
                            )}
                          </div>
                          <div className="step-action">{stepName}</div>
                          {stepDuration && (
                            <div className="step-duration">
                              <i className="fas fa-stopwatch" /> {stepDuration}
                              ms
                            </div>
                          )}
                          {stepError && (
                            <div className="step-error">
                              <i className="fas fa-exclamation-triangle" />{" "}
                              {stepError}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
