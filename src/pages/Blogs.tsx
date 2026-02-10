import { useState, useEffect } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles
import { Plus, Edit, Trash2, ExternalLink, MoreHorizontal, Image as ImageIcon, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageCard } from "@/components/dashboard/PageCard";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast"; // Assuming you have a toast component

// API Base URL
const API_URL = "https://api.clickplick.co.uk/api";
const API_URL2 = "https://api.clickplick.co.uk";

const Blogs = () => {
  const { toast } = useToast();
  
  // Data States
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    short_content: "",
    content: "",
    tag: "",
    link: "", // Used for Featured Image URL
    author: "",
    attr: "",
    language: "en"
  });

  // Fetch Initial Data
  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/posts`);
      setBlogs(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({ title: "Error", description: "Failed to load blog posts", variant: "destructive" });
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/posts/categories/all`);
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Handle Form Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Rich Text Change
  const handleContentChange = (value) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  // Handle Select Change
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageData = new FormData();
    imageData.append("image", file);

    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/gallery`, imageData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Assuming API returns { url: '/uploads/filename.jpg' }
      setFormData((prev) => ({ ...prev, link: res.data.url }));
      toast({ title: "Success", description: "Image uploaded successfully" });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Error", description: "Image upload failed", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create Post
  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/posts`, formData);
      toast({ title: "Success", description: "Blog post created successfully" });
      setAddModalOpen(false);
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error("Create error:", error);
      toast({ title: "Error", description: "Failed to create post", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (blog) => {
    setSelectedBlog(blog);
    setFormData({
      title: blog.title,
      category_id: blog.category_id,
      short_content: blog.short_content,
      content: blog.content,
      tag: blog.tag,
      link: blog.link,
      author: blog.author,
      attr: blog.attr,
      language: blog.language || "en"
    });
    setEditModalOpen(true);
  };

  // Update Post
  const handleUpdate = async () => {
    if (!selectedBlog) return;
    setIsSubmitting(true);
    try {
      await axios.put(`${API_URL}/posts/${selectedBlog.id}`, formData);
      toast({ title: "Success", description: "Blog post updated successfully" });
      setEditModalOpen(false);
      fetchPosts();
    } catch (error) {
      console.error("Update error:", error);
      toast({ title: "Error", description: "Failed to update post", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Post
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`${API_URL}/posts/${id}`);
      toast({ title: "Deleted", description: "Blog post deleted" });
      setBlogs(blogs.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      toast({ title: "Error", description: "Failed to delete post", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category_id: "",
      short_content: "",
      content: "",
      tag: "",
      link: "",
      author: "",
      attr: "",
      language: "en"
    });
  };

  // Quill Modules (Toolbar options)
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  return (
    <AdminLayout title="Blogs Management" subtitle="Create and manage blog posts">
      <PageCard
        action={
          <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Create Blog
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Blog Post</DialogTitle>
                <DialogDescription>Add a new article to your blog</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input name="title" value={formData.title} onChange={handleInputChange} placeholder="Blog post title" />
                </div>

                {/* Category & Author Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select onValueChange={(val) => handleSelectChange("category_id", val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Author</Label>
                    <Input name="author" value={formData.author} onChange={handleInputChange} placeholder="Author name" />
                  </div>
                </div>

                {/* Featured Image Upload */}
                <div className="space-y-2">
                  <Label>Featured Image</Label>
                  <div className="flex gap-4 items-center">
                    <Input type="file" accept="image/*" onChange={handleImageUpload} />
                    {formData.link && (
                      <img src={`${API_URL2}${formData.link}`} alt="Preview" className="h-10 w-10 object-cover rounded border" />
                    )}
                  </div>
                  {isSubmitting && <p className="text-xs text-blue-500">Uploading image...</p>}
                </div>

                {/* Short Description */}
                <div className="space-y-2">
                  <Label>Short Description</Label>
                  <Textarea name="short_content" value={formData.short_content} onChange={handleInputChange} placeholder="Brief summary..." rows={2} />
                </div>

                {/* Rich Text Content */}
                <div className="space-y-2">
                  <Label>Content</Label>
                  <ReactQuill 
                    theme="snow" 
                    value={formData.content} 
                    onChange={handleContentChange} 
                    modules={quillModules}
                    className="h-40 mb-12" // mb-12 to handle toolbar height
                  />
                </div>

                {/* Tags & Attr */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <Input name="tag" value={formData.tag} onChange={handleInputChange} placeholder="Comma separated tags" />
                  </div>
                  <div className="space-y-2">
                    <Label>Attributes (Optional)</Label>
                    <Input name="attr" value={formData.attr} onChange={handleInputChange} placeholder="Extra attributes" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Blog"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading posts...</TableCell>
                </TableRow>
              ) : blogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">No posts found.</TableCell>
                </TableRow>
              ) : (
                blogs.map((blog) => (
                  <TableRow key={blog.id}>
                    <TableCell>
                      {blog.link ? (
                         <img
                           src={`${API_URL2}${blog.link}`}
                           alt={blog.title}
                           className="h-12 w-20 rounded-md object-cover border"
                           onError={(e) => { e.target.src = "https://via.placeholder.com/80?text=No+Img"; }}
                         />
                      ) : (
                        <div className="h-12 w-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{blog.title}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {blog.category_name || "Uncategorized"}
                      </span>
                    </TableCell>
                    <TableCell>{blog.author}</TableCell>
                    <TableCell>{new Date(blog.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditModal(blog)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(blog.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </PageCard>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label>Title</Label>
              <Input name="title" value={formData.title} onChange={handleInputChange} />
            </div>

            {/* Category & Author Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category_id?.toString()} onValueChange={(val) => handleSelectChange("category_id", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Author</Label>
                <Input name="author" value={formData.author} onChange={handleInputChange} />
              </div>
            </div>

            {/* Featured Image Upload */}
            <div className="space-y-2">
              <Label>Featured Image</Label>
              <div className="flex gap-4 items-center">
                <Input type="file" accept="image/*" onChange={handleImageUpload} />
                {formData.link && (
                  <img src={`${API_URL2}${formData.link}`} alt="Preview" className="h-10 w-10 object-cover rounded border" />
                )}
              </div>
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <Label>Short Description</Label>
              <Textarea name="short_content" value={formData.short_content} onChange={handleInputChange} rows={2} />
            </div>

            {/* Rich Text Content */}
            <div className="space-y-2">
              <Label>Content</Label>
              <ReactQuill 
                theme="snow" 
                value={formData.content} 
                onChange={handleContentChange} 
                modules={quillModules}
                className="h-40 mb-12"
              />
            </div>

            {/* Tags */}
            <div className="pt-4 space-y-2">
              <Label>Tags</Label>
              <Input name="tag" value={formData.tag} onChange={handleInputChange} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Blogs;