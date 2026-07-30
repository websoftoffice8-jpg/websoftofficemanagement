import { useEffect, useState } from "react";
import api from "../../../API/Axios";
import ENDPOINTS from "../../../API/endpoints";
import PermissionTable from "./PermissionTable";
import PermissionFilter from "./PermissionFilter";

export default function Permissions() {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("desc");



    useEffect(() => {
        fetchPermissions();
    }, []);





    const fetchPermissions = async () => {
        try {
            const res = await api.get(ENDPOINTS.PERMISSIONS);

            setPermissions(
                res.data.sort((a, b) =>
                    (b.fromDate || b.date).localeCompare(a.fromDate || a.date)
                )
            );
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    const filteredPermissions = permissions
        .filter((permission) => {
            const matchesSearch =
                permission.name.toLowerCase().includes(search.toLowerCase()) ||
                permission.employeeId.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "all" || permission.status === statusFilter;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) =>
            sortOrder === "desc"
                ? (b.fromDate || b.date).localeCompare(a.fromDate || a.date)
                : (a.fromDate || a.date).localeCompare(b.fromDate || b.date)
        );



    const handleApprove = async (permission) => {
        try {
            await api.patch(
                `${ENDPOINTS.PERMISSIONS}/${permission.id}`,
                {
                    status: "Approved",
                }
            );

            fetchPermissions();
        } catch (err) {
            console.error(err);
        }
    };

    const handleReject = async (permission) => {
        try {
            await api.patch(
                `${ENDPOINTS.PERMISSIONS}/${permission.id}`,
                {
                    status: "Rejected",
                }
            );

            fetchPermissions();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-slate-500">
                Loading...
            </div>
        );
    }



    return (
        <div className="max-w-7xl mx-auto p-8">

            <h1 className="text-3xl font-bold text-slate-800">
                Leave Permissions
            </h1>

            <p className="text-slate-500 mt-1 mb-8">
                Review employee leave requests.
            </p>

            <PermissionFilter
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
            />

            <PermissionTable
                permissions={filteredPermissions}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </div>
    );
}