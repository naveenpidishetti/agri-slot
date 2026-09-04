const AgriData = {
  weather: {
    temp: "29°C",
    condition: "Partly Cloudy",
    humidity: "68%",
    rainProb: "25%",
    soilMoisture: "Optimal (72%)",
    windSpeed: "14 km/h",
    uvIndex: "6 Moderate",
    recommendation: "Favorable conditions for micro-irrigation slot booking between 07:00 AM and 10:00 AM."
  },
  dashboardStats: {
    totalLand: "14.5 Acres",
    activeSlots: 4,
    harvestCountdown: "18 Days",
    equipmentRented: 2
  },
  featuredCrops: [
    {
      id: "rice",
      name: "Samba Mahsuri (Paddy / Rice)",
      variety: "BPT 5204",
      stage: "Flowering & Grain Formation",
      stagePercent: 65,
      acres: 6.0,
      field: "North Field Plot-A",
      sowingDate: "2026-06-10",
      harvestDate: "2026-10-15",
      health: "Excellent",
      waterRequirement: "High (50mm/week)",
      pestRisk: "Low (PCP Alert Clean)",
      image: "🌾",
      color: "#22C55E"
    },
    {
      id: "cotton",
      name: "Bt Cotton Hybrid",
      variety: "RCH 659 BG II",
      stage: "Boll Development",
      stagePercent: 45,
      acres: 4.5,
      field: "East Field Plot-B",
      sowingDate: "2026-06-25",
      harvestDate: "2026-11-20",
      health: "Good",
      waterRequirement: "Medium (30mm/week)",
      pestRisk: "Moderate (Pink Bollworm Scan Advisory)",
      image: "🌱",
      color: "#F59E0B"
    },
    {
      id: "chilli",
      name: "Guntur Red Chilli",
      variety: "Teja S17",
      stage: "Vegetative & Flowering",
      stagePercent: 35,
      acres: 2.5,
      field: "South Field Plot-C",
      sowingDate: "2026-07-05",
      harvestDate: "2026-12-10",
      health: "Very Good",
      waterRequirement: "Low (20mm/week)",
      pestRisk: "Low",
      image: "🌶️",
      color: "#EF4444"
    },
    {
      id: "maize",
      name: "Hybrid Yellow Maize",
      variety: "Pioneer 3307",
      stage: "Germination & Early Leaf",
      stagePercent: 20,
      acres: 1.5,
      field: "West Field Plot-D",
      sowingDate: "2026-07-28",
      harvestDate: "2026-11-05",
      health: "Healthy",
      waterRequirement: "Medium",
      pestRisk: "Low",
      image: "🌽",
      color: "#EAB308"
    }
  ],
  tasks: [
    {
      id: "task-1",
      cropId: "rice",
      title: "Bio-Fertilizer Spraying Slot",
      date: "Tomorrow, 07:00 AM",
      field: "North Field Plot-A",
      type: "Drone Spraying",
      status: "Upcoming",
      priority: "High"
    },
    {
      id: "task-2",
      cropId: "cotton",
      title: "Drip Irrigation Slot Reservation",
      date: "Aug 18, 06:00 AM",
      field: "East Field Plot-B",
      type: "Irrigation Pump",
      status: "Upcoming",
      priority: "Medium"
    },
    {
      id: "task-3",
      cropId: "chilli",
      title: "Soil Moisture & NPK Testing",
      date: "Aug 19, 10:00 AM",
      field: "South Field Plot-C",
      type: "Soil Testing",
      status: "Scheduled",
      priority: "Medium"
    },
    {
      id: "task-4",
      cropId: "rice",
      title: "Rotavator Tillage Slot",
      date: "Aug 12, 08:00 AM",
      field: "North Field Plot-A",
      type: "Tractor Tillage",
      status: "Completed",
      priority: "Low"
    }
  ],
  activeSlots: [
    {
      id: "SLOT-8091",
      serviceName: "Mahindra 575 DI Tractor + Rotavator",
      category: "Machinery",
      date: "Aug 17, 2026",
      time: "06:00 AM - 10:00 AM",
      field: "East Field Plot-B",
      operator: "Suresh Kumar (Verified)",
      status: "Confirmed",
      cost: "₹1,800",
      badgeColor: "#22C55E"
    },
    {
      id: "SLOT-8092",
      serviceName: "Agritech Precision Spraying Drone (10L)",
      category: "Drone",
      date: "Aug 18, 2026",
      time: "07:00 AM - 09:00 AM",
      field: "North Field Plot-A",
      operator: "FlyAgri Solutions",
      status: "Confirmed",
      cost: "₹1,200",
      badgeColor: "#22C55E"
    },
    {
      id: "SLOT-8093",
      serviceName: "Solar Smart Pump Irrigation Slot (5HP)",
      category: "Irrigation",
      date: "Aug 19, 2026",
      time: "05:00 PM - 08:00 PM",
      field: "South Field Plot-C",
      operator: "Auto-Grid Slot",
      status: "Scheduled",
      cost: "₹450",
      badgeColor: "#F59E0B"
    },
    {
      id: "SLOT-8094",
      serviceName: "Mandi Cold Storage Space (50 Quintals)",
      category: "Storage",
      date: "Sep 01 - Sep 30",
      time: "24/7 Access",
      field: "Guntur Central Warehouse",
      operator: "AP Agmark Coldstore",
      status: "Booked",
      cost: "₹4,500",
      badgeColor: "#3B82F6"
    }
  ],
  services: [
    { id: "s1", name: "Heavy Tractor & Tillage", rate: "₹450/hr", icon: "🚜", desc: "Tractors with Rotavator, Cultivator & Disc Plough." },
    { id: "s2", name: "Autonomous Drone Spraying", rate: "₹350/acre", icon: "🚁", desc: "Targeted bio-pesticide and micronutrient spraying." },
    { id: "s3", name: "Smart Irrigation Pump Slot", rate: "₹150/hr", icon: "💧", desc: "High-efficiency solar & electric pump grid reservation." },
    { id: "s4", name: "Combine Harvester", rate: "₹1,600/hr", icon: "🌾", desc: "Paddy & Maize multi-crop high capacity harvester." },
    { id: "s5", name: "IoT Soil Health Testing", rate: "₹500/test", icon: "🧪", desc: "Instant NPK, pH & EC soil analysis with digital report." },
    { id: "s6", name: "Cold Storage & Transport", rate: "₹90/quintal", icon: "🚛", desc: "Refrigerated transport & Mandi warehouse slot." }
  ],
  analytics: {
    projectedYield: "280 Quintals",
    estimatedRevenue: "₹8,40,000",
    totalExpenses: "₹2,65,000",
    netProfit: "₹5,75,000",
    waterSavedPercent: "32%"
  },
  aiPrompts: [
    "What is the best pesticide spray slot timing for Paddy in humid weather?",
    "How to manage Pink Bollworm in Cotton during boll stage?",
    "Suggest optimum NPK fertilizer schedule for Chilli crops.",
    "How do I reserve a Combine Harvester slot for early October?"
  ]
};
