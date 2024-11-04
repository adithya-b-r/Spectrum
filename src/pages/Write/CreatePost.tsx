import React, { useState } from 'react';
import { toast } from 'react-toastify';

export const CreatePost: React.FC = () => {
  const [title, setTitle] = useState<string>(''); // State to hold the title
  const [sections, setSections] = useState<{ type: string; content: string | null }[]>([]); // No default sections

  // Function to add a new section
  const addSection = (type: string) => {
    setSections([...sections, { type, content: type === 'text' ? '' : null }]);
  };

  // Function to handle title change
  const handleTitleChange = (value: string) => {
    setTitle(value);
  };

  // Function to handle text change
  const handleTextChange = (index: number, value: string) => {
    const newSections = [...sections];
    newSections[index].content = value;
    setSections(newSections);
  };

  // Function to handle image upload
  const handleImageChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newSections = [...sections];
        newSections[index].content = reader.result as string; // Set the image data URL
        setSections(newSections);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to remove a section
  const removeSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
  };

  // Function to publish the post
  const publishPost = () => {
    // Logic to handle publishing the post (e.g., send to server, save to database)
    console.log("Post published:", { title, sections });
    toast.success("Uploaded Post Successfully!");
    setSections([]);
  };

  return (
    <div className="w-full h-screen p-5 bg-gray-100">
      <h1 className="text-4xl font-bold text-center mb-8">New Post</h1>

      <div className="flex flex-col font-semibold bg-white rounded-lg shadow-md p-6">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="p-3 w-full rounded-md focus:outline-none border-2 border-gray-300 mb-4"
        />
        {sections.length === 0 ? (
          <p className="text-gray-500 mb-4">No sections added yet. Use the buttons below to add content.</p>
        ) : (
          sections.map((section, index) => (
            <div key={index} className="mb-4 p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex-grow mr-4">
                  {section.type === 'text' ? (
                    <textarea
                      rows={4}
                      placeholder="Content"
                      value={section.content || ""}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                      className="p-3 w-full rounded-md focus:outline-none border-2 border-gray-300 resize-none mb-2"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      {section.content ? (
                        <img
                          src={section.content}
                          alt="Preview"
                          className="w-full max-w-[720px] h-auto border border-gray-300 rounded-md"
                        />
                      ) : (
                        <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                          <p className="text-gray-500 text-center">No image selected. Click "Add Image" to upload.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  {/* Show the Add Image button only for image sections */}
                  {section.type === 'image' && (
                    <label className="cursor-pointer flex items-center p-2 text-blue-600 hover:opacity-80">
                      <i className='bx bx-image-add mr-1 text-2xl md:text-4xl'></i>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(index, e)}
                      />
                    </label>
                  )}
                  <button
                    onClick={() => removeSection(index)}
                    className="flex items-center p-2 text-red-600 hover:opacity-80"
                  >
                    <i className='bx bx-trash mr-1 text-2xl md:text-4xl'></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        <div className="w-full flex items-center justify-center gap-5 mb-4">
          <button
            onClick={() => addSection('text')}
            className="mt-4 p-2 rounded-md border-2 border-gray-400 font-semibold hover:bg-gray-200"
          >
            Add Text
          </button>
          <button
            onClick={() => addSection('image')}
            className="mt-4 p-2 rounded-md border-2 border-gray-400 font-semibold hover:bg-gray-200"
          >
            Add Image
          </button>
        </div>
        <div className="flex justify-center">
          <button
            onClick={publishPost}
            className="mt-4 px-5 py-2 tracking-wider rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Publish Post
          </button>
        </div>
      </div>
    </div>
  );
};
