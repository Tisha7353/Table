import React, { useState, useEffect } from 'react';
import { DataTable, DataTableStateEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { useQuery } from 'react-query';
import axios from 'axios';

// Define the structure of artwork data
type Artwork = {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: number;
    date_end: number;
};

// Fetch artworks from the API
const fetchArtworks = async (page: number) => {
    const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}`);
    return response.data;
};

// ArtTable component
const ArtTable: React.FC = () => {
    const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});
    const [page, setPage] = useState(1);
    const [selectAll, setSelectAll] = useState(false); // To track if all rows are selected
    const [numRowsToSelect, setNumRowsToSelect] = useState<number | ''>('');

    // Fetch data using react-query
    const { data, isLoading } = useQuery(['artworks', page], () => fetchArtworks(page), {
        keepPreviousData: true,
    });

    // Handle pagination
    const handlePageChange = (event: DataTableStateEvent) => {
        const newPage = (event.page ?? 0) + 1; // Handle the case where page is undefined
        setPage(newPage);
    };

    // Handle individual row selection
    const handleRowSelection = (row: Artwork) => {
        const updatedSelections = { ...selectedRows };
        if (updatedSelections[row.id]) {
            delete updatedSelections[row.id];
        } else {
            updatedSelections[row.id] = true;
        }
        setSelectedRows(updatedSelections);
    };

    // Handle "Select All" functionality
    const handleSelectAllChange = () => {
        const updatedSelections = { ...selectedRows };
        if (selectAll) {
            data?.data.forEach((row: Artwork) => {
                delete updatedSelections[row.id];
            });
        } else {
            data?.data.forEach((row: Artwork) => {
                updatedSelections[row.id] = true;
            });
        }
        setSelectedRows(updatedSelections);
        setSelectAll(!selectAll);
    };

    // Select a specified number of rows
    const handleSelectNumberOfRows = () => {
        const updatedSelections = { ...selectedRows };
        const rowsToSelect = data?.data.slice(0, numRowsToSelect as number) || [];

        rowsToSelect.forEach((row: Artwork) => {
            updatedSelections[row.id] = true;
        });

        setSelectedRows(updatedSelections);
    };

    // Check if all rows on the current page are selected
    useEffect(() => {
        if (data?.data) {
            const allSelected = data.data.every((row: Artwork) => selectedRows[row.id]);
            setSelectAll(allSelected);
        }
    }, [data, selectedRows]);

    return (
        <div className="p-6 max-w-screen-lg mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Artwork Table with Custom Selection</h3>

            {/* Custom Row Selection Panel */}
            <div className="mb-6 p-4 border rounded-lg shadow-sm bg-white">
                <h4 className="text-xl font-semibold mb-3 text-gray-700">Selected Rows</h4>
                <p className="mb-3 text-gray-600">{Object.keys(selectedRows).length} row(s) selected</p>
                <div className="flex space-x-4">
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => setSelectedRows({})}
                    >
                        Clear Selection
                    </button>
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            value={numRowsToSelect}
                            onChange={(e) => setNumRowsToSelect(Number(e.target.value))}
                            placeholder="Number of rows"
                            min="1"
                            className="px-3 py-2 border rounded-lg w-32 text-gray-700"
                        />
                        <button
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            onClick={handleSelectNumberOfRows}
                        >
                            Select Rows
                        </button>
                    </div>
                </div>
            </div>

            <DataTable
                value={data?.data}
                paginator
                rows={10}
                first={(page - 1) * 10}
                onPage={handlePageChange}
                loading={isLoading}
                dataKey="id"
                className="shadow-sm bg-white rounded-lg"
            >
                {/* Checkbox to Select All Rows */}
                <Column
                    header={
                        <Checkbox
                            checked={selectAll}
                            onChange={handleSelectAllChange}
                            className="p-checkbox"
                        />
                    }
                    body={(rowData: Artwork) => (
                        <Checkbox
                            checked={!!selectedRows[rowData.id]}
                            onChange={() => handleRowSelection(rowData)}
                            className="p-checkbox"
                        />
                    )}
                    className="text-center"
                ></Column>

                {/* Other Data Columns */}
                <Column field="title" header="Title" className="text-gray-800"></Column>
                <Column field="place_of_origin" header="Place of Origin" className="text-gray-800"></Column>
                <Column field="artist_display" header="Artist" className="text-gray-800"></Column>
                <Column field="inscriptions" header="Inscriptions" className="text-gray-800"></Column>
                <Column field="date_start" header="Start Date" className="text-gray-800"></Column>
                <Column field="date_end" header="End Date" className="text-gray-800"></Column>
            </DataTable>
        </div>
    );
};

export default ArtTable;
