import { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import API from "../../api/axios";
import { handleUpdate } from "../../utils/CrudAction";
import AdminLayout from "./AdminLayout";
import DashboardPageHeader from "../../components/ui/DashboardPageHeader";

const TermsCondition = () => {
    const [title, setTitle] = useState("Terms & Conditions");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await API.get("/admin/terms");
                const data = res.data?.data || res.data;

                if (data) {
                    setTitle(data.title || "");
                    setContent(data.content || "");
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        await handleUpdate({
            route: "admin/terms",
            data: { title, content },
            successMessage: "Terms updated successfully",
        });

        setLoading(false);
    };

    return (
        <AdminLayout>
            <DashboardPageHeader title="Terms & Conditions Manager" />
            <p className="text-body-secondary mb-4">Update website legal content from here</p>

            <div className="cw-card">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="form-label fw-semibold">Title</label>
                        <input
                            type="text"
                            className="form-control"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter title..."
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-semibold">Content</label>

                        <div className="cw-editor-wrap">
                            <CKEditor
                                editor={ClassicEditor}
                                data={content || ""}
                                config={{
                                    toolbar: [
                                        "heading",
                                        "|",
                                        "bold",
                                        "italic",
                                        "link",
                                        "bulletedList",
                                        "numberedList",
                                        "blockQuote",
                                        "|",
                                        "undo",
                                        "redo",
                                    ],
                                    heading: {
                                        options: [
                                            { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
                                            { model: "heading1", view: "h1", title: "Heading 1" },
                                            { model: "heading2", view: "h2", title: "Heading 2" },
                                            { model: "heading3", view: "h3", title: "Heading 3" },
                                        ],
                                    },
                                }}
                                onChange={(event, editor) => {
                                    const html = editor.getData();
                                    setContent(html);
                                }}
                            />
                        </div>
                    </div>

                    <button type="submit" className="nav-btn primary" style={{ height: 44 }} disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>
        </AdminLayout>
    );
};

export default TermsCondition;
