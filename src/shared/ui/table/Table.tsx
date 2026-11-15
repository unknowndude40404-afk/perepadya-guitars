import {
    Children,
    isValidElement,
    type ReactNode,
} from "react";

type ColumnAlign = "left" | "center" | "right";

type ColumnProps<T> = {
    title?: ReactNode;
    align?: ColumnAlign;
    width?: string;
    className?: string;
    headClassName?: string;
    children: (item: T, index: number) => ReactNode;
};

/** Marker component: Table reads its props from children and renders the cells itself. */
export function Column<T>(props: ColumnProps<T>) {
    void props;

    return null;
}

type TableProps<T> = {
    data: T[];
    getRowKey: (item: T, index: number) => string;
    children: ReactNode;
    emptyMessage?: ReactNode;
    onRowClick?: (item: T) => void;
    className?: string;
};

const alignClasses: Record<ColumnAlign, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
};

export function Table<T>({
    data,
    getRowKey,
    children,
    emptyMessage = "Немає даних",
    onRowClick,
    className = "",
}: TableProps<T>) {
    const columns = Children.toArray(children).filter(
        (child): child is React.ReactElement<ColumnProps<T>> =>
            isValidElement(child),
    );

    if (data.length === 0) {
        return (
            <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6 text-sm text-[var(--text-secondary)]">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)]">
            <table
                className={`w-full border-collapse text-sm ${className}`}
            >
                <thead className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                    <tr>
                        {columns.map((column, columnIndex) => (
                            <th
                                key={columnIndex}
                                style={{
                                    width: column.props.width,
                                }}
                                className={`whitespace-nowrap px-4 py-3 font-medium text-[var(--text-secondary)] ${alignClasses[
                                    column.props.align ?? "left"
                                    ]
                                    } ${column.props.headClassName ?? ""}`}
                            >
                                {column.props.title}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data.map((item, rowIndex) => (
                        <tr
                            key={getRowKey(item, rowIndex)}
                            onClick={
                                onRowClick
                                    ? () => onRowClick(item)
                                    : undefined
                            }
                            className={`border-b border-[var(--border-primary)] transition last:border-b-0 hover:bg-[var(--bg-secondary)] ${onRowClick ? "cursor-pointer" : ""
                                }`}
                        >
                            {columns.map((column, columnIndex) => (
                                <td
                                    key={columnIndex}
                                    className={`px-4 py-3 text-[var(--text-primary)] ${alignClasses[
                                        column.props.align ?? "left"
                                        ]
                                        } ${column.props.className ?? ""}`}
                                >
                                    {column.props.children(
                                        item,
                                        rowIndex,
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}