
import dbConnect from './db';
import Vehicle from './models/Vehicle';
import Customer from './models/Customer';
import Booking from './models/Booking';
import Maintenance from './models/Maintenance';
import Payment from './models/Payment';

export async function getVehicles() {
    await dbConnect();
    try {
        const vehicles = await Vehicle.find({}).sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(vehicles));
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        return [];
    }
}

export async function getPayments() {
    await dbConnect();
    try {
        const payments = await Payment.find({}).sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(payments));
    } catch (error) {
        console.error('Error fetching payments:', error);
        return [];
    }
}

export async function getDashboardStats() {
    await dbConnect();
    try {
        const totalVehicles = await Vehicle.countDocuments();
        const availableVehicles = await Vehicle.countDocuments({
            status: 'Available',
        });
        const activeRentals = await Booking.countDocuments({ status: 'Active' });
        const pendingPayments = await Payment.countDocuments({ status: 'Pending' }); // Example query
        const totalCustomers = await Customer.countDocuments();

        // Calculate monthly revenue (simple sum of all payments for now or specific logic)
        // For now returning mock value or sum of payments
        const payments = await Payment.find({}).lean();
        const monthlyRevenue = payments.reduce(
            (sum, p) => sum + (p.amount || 0),
            0
        );

        return {
            totalVehicles,
            availableVehicles,
            activeRentals,
            monthlyRevenue,
            pendingPayments,
            totalCustomers,
        };
    } catch (error) {
        console.error('Error fetching stats:', error);
        return {
            totalVehicles: 0,
            availableVehicles: 0,
            activeRentals: 0,
            monthlyRevenue: 0,
            pendingPayments: 0,
            totalCustomers: 0,
        };
    }
}

export async function getBookings() {
    await dbConnect();
    try {
        const bookings = await Booking.find({}).lean();
        return JSON.parse(JSON.stringify(bookings));
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return [];
    }
}

export async function getCustomers() {
    await dbConnect();
    try {
        const customers = await Customer.find({}).lean();
        return JSON.parse(JSON.stringify(customers));
    } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
    }
}

export async function getCustomerById(id: string) {
    await dbConnect();
    try {
        const customer = await Customer.findOne({ id }).lean();
        return JSON.parse(JSON.stringify(customer));
    } catch (error) {
        console.error('Error fetching customer:', error);
        return null;
    }
}

export async function getVehicleById(id: string) {
    await dbConnect();
    try {
        let vehicle = await Vehicle.findOne({ id }).lean();
        if (!vehicle) {
            try {
                // strict check for ObjectId validity usually needed, but findById handles some
                vehicle = await Vehicle.findById(id).lean();
            } catch {
                // ignore
            }
        }
        if (!vehicle) return null;
        return JSON.parse(JSON.stringify(vehicle));
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        return null;
    }
}

export async function getMonthlyRevenue() {
    await dbConnect();
    try {
        // Aggregation to group payments by month
        // Since dates are strings in our current mock data but Dates in schema?
        // Wait, mock data had "2026-02-05". Schema has Date.
        // If seed script used insertMany with strings, Mongoose casts them to Date.
        // So we can use $month in aggregation.

        // Simplified: Fetch all payments and group in JS for now to avoid complex Mongo syntax debugging.
        const payments = await Payment.find({ status: 'Paid' }).lean();

        const revenueMap: Record<string, { revenue: number; bookings: number }> = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payments.forEach((p: any) => {
            if (!p.paidAt) return;
            const date = new Date(p.paidAt);
            const month = monthNames[date.getMonth()];
            if (!revenueMap[month]) {
                revenueMap[month] = { revenue: 0, bookings: 0 };
            }
            revenueMap[month].revenue += p.amount;
            revenueMap[month].bookings += 1;
        });

        const result = Object.entries(revenueMap).map(([month, data]) => ({
            month,
            revenue: data.revenue,
            bookings: data.bookings,
        }));

        // Sort by month index? or just return as is (recharts handles it if order is correct)
        // For now, let's just return what we have.
        return result;
    } catch (error) {
        console.error('Error fetching monthly revenue:', error);
        return [];
    }
}


export async function getVehicleUtilization() {
    await dbConnect();
    try {
        const vehicles = await Vehicle.find({}).lean();
        const totalByCategory: Record<string, number> = {};
        const utilizedByCategory: Record<string, number> = {};

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vehicles.forEach((v: any) => {
            const cat = v.category;
            totalByCategory[cat] = (totalByCategory[cat] || 0) + 1;
            if (v.status === 'Rented') {
                utilizedByCategory[cat] = (utilizedByCategory[cat] || 0) + 1;
            }
        });

        const result = Object.keys(totalByCategory).map(category => {
            const total = totalByCategory[category];
            const utilizedCount = utilizedByCategory[category] || 0;
            const utilized = Math.round((utilizedCount / total) * 100);
            return {
                category,
                utilized,
                idle: 100 - utilized
            };
        });

        return result;
    } catch (error) {
        console.error('Error fetching utilization:', error);
        return [];
    }
}

export async function getMaintenanceRecords() {
    await dbConnect();
    try {
        const records = await Maintenance.find({}).sort({ serviceDate: -1 }).lean();
        return JSON.parse(JSON.stringify(records));
    } catch (error) {
        console.error('Error fetching maintenance records:', error);
        return [];
    }
}

export async function getMaintenanceById(id: string) {
    await dbConnect();
    try {
        let record = await Maintenance.findOne({ id }).lean();
        if (!record) {
            try { record = await Maintenance.findById(id).lean(); } catch { }
        }
        if (!record) return null;
        return JSON.parse(JSON.stringify(record));
    } catch (error) {
        console.error('Error fetching maintenance record:', error);
        return null;
    }
}

export async function getBookingById(id: string) {
    await dbConnect();
    try {
        let booking = await Booking.findOne({ id }).lean();
        if (!booking) {
            try { booking = await Booking.findById(id).lean(); } catch { }
        }
        if (!booking) return null;
        return JSON.parse(JSON.stringify(booking));
    } catch (error) {
        console.error('Error fetching booking:', error);
        return null;
    }
}

export async function getPaymentById(id: string) {
    await dbConnect();
    try {
        let payment = await Payment.findOne({ id }).lean();
        if (!payment) {
            try { payment = await Payment.findById(id).lean(); } catch { }
        }
        if (!payment) return null;
        return JSON.parse(JSON.stringify(payment));
    } catch (error) {
        console.error('Error fetching payment:', error);
        return null;
    }
}
