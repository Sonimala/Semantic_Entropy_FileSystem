
import React, { useState, useEffect, useMemo } from 'react';
import { FileNode, SemanticCluster, OSActionType, OSLog } from './types';
import { analyzeFileContent } from './services/geminiService';
import FileNodeGraph from './components/FileNodeGraph';
import FolderView from './components/FolderView';
import FileDetailModal from './components/FileDetailModal';
import OSMonitor from './components/OSMonitor';
import Auth from './components/Auth';

const INITIAL_FILES: FileNode[] = [
  {
    id: 'ml-1',
    name: 'neural-networks-intro.md',
    content: `Neural networks are computational models inspired by the human brain's biological neural structure. At their core, they consist of interconnected layers of artificial neurons, or "nodes," which process and transmit information. A standard feedforward neural network includes an input layer, one or more hidden layers, and an output layer. Each connection between neurons has an associated weight that represents its relative importance. During the training process, the network uses a technique called backpropagation to minimize the difference between its predicted output and the actual target.

The fundamental unit of a neural network is the perceptron. A perceptron takes multiple binary inputs, multiplies them by their respective weights, and passes the sum through an activation function like ReLU (Rectified Linear Unit), Sigmoid, or Tanh. ReLU is particularly popular in deep learning because it helps mitigate the vanishing gradient problem, allowing for the training of much deeper networks.

Deep Learning refers to neural networks with many hidden layers. These architectures, such as Convolutional Neural Networks (CNNs) for image processing and Recurrent Neural Networks (RNNs) for sequential data, have revolutionized fields like computer vision and natural language processing. In a CNN, specialized layers perform convolutions to detect spatial hierarchies of features, starting from simple edges to complex objects.

Modern neural networks are optimized using Gradient Descent. This iterative optimization algorithm adjusts the weights in the direction that reduces the loss function. There are several variants, including Stochastic Gradient Descent (SGD) and Adam (Adaptive Moment Estimation), which dynamically adjusts the learning rate for each parameter. Overfitting remains a significant challenge, often addressed through regularization techniques like Dropout, L2 normalization, or Early Stopping.

As we move toward Artificial General Intelligence (AGI), the scale of these networks has grown exponentially. Large Language Models (LLMs) like GPT-4 utilize Transformer architectures, which rely on "Self-Attention" mechanisms to process entire sequences of text simultaneously rather than sequentially. This allows the model to understand context and long-range dependencies more effectively than previous RNN-based models.`,
    type: 'text',
    category: 'Machine Learning',
    keywords: ['Neural Networks', 'AI', 'Deep Learning', 'Backpropagation'],
    size: 4200,
    lastModified: Date.now() - 3600000
  },
  {
    id: 'gt-1',
    name: 'graph-algorithms.md',
    content: `Graph theory is the study of graphs, which are mathematical structures used to model pairwise relations between objects. A graph is made up of vertices (also called nodes) and edges (also called links) that connect them. Graphs can be directed or undirected, weighted or unweighted, and cyclic or acyclic. Understanding these properties is crucial for selecting the right algorithm for a specific problem.

One of the most famous algorithms in graph theory is Dijkstra's algorithm. Conceived by computer scientist Edsger W. Dijkstra, it is used to find the shortest path between nodes in a weighted graph. It maintains a set of unvisited nodes and calculates a tentative distance from the source to every other node. By greedily selecting the node with the smallest tentative distance at each step, it guarantees the shortest path for non-negative edge weights.

For scenarios where we have heuristic information, the A* (A-star) algorithm is often preferred. A* is an extension of Dijkstra's that uses a heuristic function to guide its search. It minimizes f(n) = g(n) + h(n), where g(n) is the cost from the start to node n, and h(n) is the estimated cost from n to the goal. In pathfinding for video games or GPS navigation, a good heuristic like Euclidean distance can significantly speed up the search process.

Traversal algorithms like Breadth-First Search (BFS) and Depth-First Search (DFS) serve as the foundation for more complex graph operations. BFS uses a queue to explore neighbors level by level, making it ideal for finding the shortest path in unweighted graphs. DFS, on the other hand, uses a stack (often through recursion) to dive as deep as possible into a branch before backtracking. DFS is particularly useful for topological sorting and detecting cycles.

Beyond simple pathfinding, graph algorithms address complex network problems. Kruskal’s and Prim’s algorithms find the Minimum Spanning Tree (MST), which connects all vertices with the minimum possible total edge weight. This is vital in infrastructure design, such as telecommunication or power grid layouts. Maximum Flow algorithms, like Ford-Fulkerson, determine the greatest amount of "flow" that can pass through a network from a source to a sink, which is critical in logistics and traffic management.`,
    type: 'text',
    category: 'Graph Theory',
    keywords: ['Dijkstra', 'Pathfinding', 'BFS', 'DFS', 'A*'],
    size: 3850,
    lastModified: Date.now() - 7200000
  },
  {
    id: 'ds-1',
    name: 'linked-list-notes.md',
    content: `A linked list is a fundamental linear data structure in which elements are stored in nodes. Unlike arrays, which store elements in contiguous memory locations, linked list nodes are scattered throughout memory. Each node contains two parts: the data and a reference (or pointer) to the next node in the sequence. This structure allows for efficient insertion and deletion of elements, as it only requires updating a few pointers rather than shifting an entire block of data.

There are several variations of linked lists, each suited for different use cases. A Singly Linked List is the simplest form, where each node points only to the next node. In a Doubly Linked List, each node contains two pointers: one to the next node and one to the previous node. This bidirectional traversal makes operations like deleting a node much easier when only a reference to that node is available. Circular Linked Lists connect the last node back to the first, creating a loop that is useful for applications like task scheduling in operating systems.

The primary advantage of linked lists over arrays is their dynamic size. An array must be declared with a fixed size, and resizing it usually involves allocating a new larger array and copying all existing elements. A linked list, however, can grow or shrink at runtime by simply allocating or deallocating individual nodes. This makes linked lists highly memory-efficient when the total number of elements is unknown or fluctuates frequently.

However, linked lists come with trade-offs. The most significant disadvantage is access time. While an array allows for O(1) random access by index, a linked list requires O(n) time to find an element, as one must traverse the list from the head node. Additionally, linked lists require more memory per element because of the extra storage needed for pointers. Cache performance is also typically worse for linked lists because the nodes are not stored contiguously, leading to more cache misses.

Common operations on linked lists include insertion, deletion, and searching. Inserting at the head of a list is an O(1) operation, whereas inserting at the tail is O(n) unless a "tail pointer" is maintained. Searching for a specific value always takes linear time. Advanced applications of linked lists include implementing other data structures like platforms, stacks, queues, and adjacency lists for graphs. They are also widely used in memory management systems to keep track of free and occupied blocks of heap memory.`,
    type: 'text',
    category: 'Data Structures',
    keywords: ['Pointers', 'Dynamic Memory', 'Nodes', 'Data Structures'],
    size: 4100,
    lastModified: Date.now() - 9000000
  },
  {
    id: 'os-1',
    name: 'process-scheduling.md',
    content: `CPU scheduling is a core function of modern operating systems, determining which process in the ready queue is allocated to the CPU. The primary goal is to maximize CPU utilization, ensure fairness, and minimize response time for users. A process typically goes through several states: New, Ready, Running, Waiting, and Terminated. The scheduler manages these transitions to keep the system responsive and efficient.

There are two main types of scheduling: Preemptive and Non-preemptive. In non-preemptive scheduling, once a process starts running, it holds the CPU until it either terminates or moves to a waiting state (e.g., for I/O). Preemptive scheduling allows the OS to interrupt a running process to give the CPU to another process, usually based on a priority system or a time slice. Most modern operating systems, like Windows and Linux, use preemptive scheduling for better multitasking.

Common scheduling algorithms include First-Come First-Served (FCFS), Shortest Job First (SJF), and Round Robin (RR). FCFS is the simplest, processing tasks in the order they arrive, but it can suffer from the "convoy effect," where short tasks wait behind a long one. SJF attempts to minimize average waiting time by picking the task with the smallest execution time next. While theoretically optimal, SJF is difficult to implement because it requires knowing the future burst time of a process.

Round Robin is the most widely used algorithm for time-sharing systems. Each process is assigned a small unit of CPU time, called a "time quantum" or "time slice." If a process doesn't finish within its quantum, it is moved to the back of the ready queue. The choice of time quantum is critical; if it's too large, RR behaves like FCFS; if it's too small, the system spends too much time on context switching overhead, reducing overall throughput.

Priority Scheduling assigns a priority level to each process, and the one with the highest priority gets the CPU first. A common problem here is "starvation," where low-priority processes never get to run because higher-priority tasks keep arriving. To solve this, "aging" is used, where the priority of a process increases the longer it waits in the ready queue. Multi-level Queue Scheduling and Multi-level Feedback Queue Scheduling are more sophisticated variants that categorize processes into different queues based on their behavior and requirements.`,
    type: 'text',
    category: 'Operating Systems',
    keywords: ['CPU', 'Scheduling', 'Preemption', 'Context Switching'],
    size: 4300,
    lastModified: Date.now() - 86400000
  },
  {
    id: 'db-1',
    name: 'sql-fundamentals.md',
    content: `Structured Query Language (SQL) is the standard language for managing and manipulating relational databases. Relational databases organize data into tables consisting of rows and columns, where each row represents a record and each column represents an attribute. The power of SQL lies in its ability to perform complex queries across multiple tables using "joins," enabling users to derive meaningful insights from raw data.

The foundation of a good database is normalization. Normalization is the process of organizing data to reduce redundancy and improve data integrity. It involves dividing a large table into smaller ones and defining relationships between them. The first three normal forms (1NF, 2NF, 3NF) are the most common standards. 1NF ensures all columns contain atomic values; 2NF removes partial dependencies; and 3NF ensures that non-key columns depend only on the primary key.

Data integrity is maintained through ACID properties: Atomicity, Consistency, Isolation, and Durability. Atomicity ensures that a transaction is "all or nothing"—either all steps succeed, or the entire transaction is rolled back. Consistency guarantees that a transaction transforms the database from one valid state to another. Isolation ensures that concurrent transactions do not interfere with each other, and Durability guarantees that once a transaction is committed, it remains saved even in the event of a system failure.

SQL commands are categorized into DDL (Data Definition Language), DML (Data Manipulation Language), DCL (Data Control Language), and TCL (Transaction Control Language). DDL includes commands like CREATE, ALTER, and DROP for managing schema objects. DML includes SELECT, INSERT, UPDATE, and DELETE for managing the data itself. DCL, through GRANT and REVOKE, handles user permissions, while TCL commands like COMMIT and ROLLBACK manage transaction flow.

Indexes are a critical feature for database performance. An index is a data structure, often a B-Tree or Hash table, that provides a fast path to the data in a table based on the values in one or more columns. While indexes speed up SELECT queries significantly, they also add overhead to INSERT, UPDATE, and DELETE operations because the index itself must be updated. Therefore, choosing which columns to index requires a careful balance between read and write performance.`,
    type: 'text',
    category: 'Databases',
    keywords: ['SQL', 'Normalization', 'ACID', 'Indexing'],
    size: 4050,
    lastModified: Date.now() - 43200000
  },
  {
    id: 'math-1',
    name: 'linear-algebra-notes.md',
    content: `Linear algebra is a branch of mathematics that deals with vectors, matrices, and linear transformations. It is the mathematical backbone of modern data science, machine learning, and computer graphics. By representing data as vectors and operations as matrices, we can perform complex transformations on millions of data points simultaneously using efficient hardware like GPUs.

A vector is an object characterized by magnitude and direction. In computer science, we often think of a vector as a one-dimensional array of numbers. Vectors can be added together or multiplied by scalars. The "dot product" of two vectors is a crucial operation that measures their similarity and is used in everything from calculating the angle between two lines to computing the attention scores in neural networks.

A matrix is a rectangular array of numbers arranged in rows and columns. Matrix multiplication is not just a mathematical curiosity; it represents a linear transformation, such as rotating, scaling, or shearing an object in 3D space. The "identity matrix" acts as the multiplicative identity, leaving any vector it multiplies unchanged. Calculating the "inverse" of a matrix allows us to reverse these transformations, though not all matrices are invertible.

Determinants and Eigenvalues are more advanced concepts with profound applications. The determinant of a matrix provides information about the scale factor of the transformation it represents. Eigenvalues and Eigenvectors describe the "characteristic" directions of a linear transformation—the directions in which a vector's direction remains unchanged even after the transformation is applied. This is the basis for Principal Component Analysis (PCA), a popular technique for dimensionality reduction in data science.

In the context of Machine Learning, every image, word, or sound is converted into a high-dimensional vector. For example, a 28x28 grayscale image is represented as a 784-dimensional vector. Neural networks consist of millions of weights organized into matrices. Processing an input involves a series of matrix-vector multiplications followed by non-linear activations. Understanding the geometry of these high-dimensional spaces is key to improving model training and generalization.`,
    type: 'text',
    category: 'Mathematics',
    keywords: ['Matrices', 'Vectors', 'Eigenvalues', 'Linear Algebra'],
    size: 3950,
    lastModified: Date.now() - 2500000
  }
];

const App: React.FC = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [files, setFiles] = useState<FileNode[]>(INITIAL_FILES);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [logs, setLogs] = useState<OSLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const addLog = (action: OSActionType, fileName: string, details: string) => {
    const newLog: OSLog = {
      timestamp: Date.now(),
      action,
      fileName,
      details
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const clusters = useMemo(() => {
    const map = new Map<string, string[]>();
    files.forEach(f => {
      const existing = map.get(f.category) || [];
      map.set(f.category, [...existing, f.id]);
    });
    
    const categoryColors: Record<string, string> = {
      'Machine Learning': '#3b82f6',
      'Graph Theory': '#ef4444',
      'Data Structures': '#8b5cf6',
      'Operating Systems': '#ec4899',
      'Databases': '#0ea5e9',
      'Computer Networks': '#f59e0b',
      'Mathematics': '#10b981',
      'Web Development': '#a855f7',
    };

    return Array.from(map.keys()).map(name => ({
      name,
      files: map.get(name) || [],
      color: categoryColors[name] || '#64748b'
    }));
  }, [files]);

  const processFile = async (name: string, content: string) => {
    setIsProcessing(true);
    const existingCats = Array.from(new Set(files.map(f => f.category))) as string[];
    const analysis = await analyzeFileContent(name, content, existingCats);
    
    const newFile: FileNode = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      content,
      type: 'text',
      category: analysis.category,
      keywords: analysis.keywords,
      size: content.length,
      lastModified: Date.now()
    };

    setFiles(prev => [...prev, newFile]);
    addLog(OSActionType.CREATE, name, `New file analyzed. AI assigned category: "${analysis.category}"`);
    setIsProcessing(false);
  };

  const renameFile = (id: string, newName: string) => {
    if (!newName.trim()) return;
    const file = files.find(f => f.id === id);
    if (!file) return;

    const oldName = file.name;
    setFiles(prev => prev.map(f => f.id === id ? { ...f, name: newName, lastModified: Date.now() } : f));
    addLog(OSActionType.RENAME, newName, `File renamed from "${oldName}" to "${newName}".`);
  };

  const updateFileContent = async (id: string, newContent: string) => {
    setIsProcessing(true);
    setShowToast(true);
    const file = files.find(f => f.id === id);
    if (!file) return;

    const existingCats = Array.from(new Set(files.map(f => f.category))) as string[];
    const analysis = await analyzeFileContent(file.name, newContent, existingCats);

    setFiles(prev => prev.map(f => 
      f.id === id ? { 
        ...f, 
        content: newContent, 
        category: analysis.category, 
        keywords: analysis.keywords, 
        size: newContent.length,
        lastModified: Date.now() 
      } : f
    ));
    
    addLog(OSActionType.MODIFY, file.name, `Content updated. Semantic mapping recalculated for "${analysis.category}"`);
    setIsProcessing(false);
    setTimeout(() => setShowToast(false), 3000);
  };

  const deleteFile = (id: string) => {
    const file = files.find(f => f.id === id);
    if (!file) return;
    
    setFiles(prev => prev.filter(f => f.id !== id));
    addLog(OSActionType.DELETE, file.name, `Removed from "${file.category}". Local entropy re-balanced.`);
    if (selectedFileId === id) setSelectedFileId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        processFile(file.name, content);
      };
      reader.readAsText(file);
    }
  };

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Immediate sign out for better UX
    setUser(null);
    setSelectedFileId(null);
    setLogs([]);
    setShowLogs(false);
  };

  const selectedFile = useMemo(() => files.find(f => f.id === selectedFileId), [files, selectedFileId]);

  if (!user) {
    return <Auth onAuthSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden text-slate-800 font-['Inter']">
      {/* Sidebar navigation */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-[#fcfdfe] relative z-20">
        <div className="p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6]">
              <i className="fas fa-sparkles text-sm"></i>
            </div>
            <h1 className="text-xl font-black tracking-tighter text-slate-900">SEFS</h1>
          </div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">Semantic File System</p>
        </div>

        <div className="p-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          <label className="block w-full cursor-pointer bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-bold py-4 rounded-2xl text-center transition-all shadow-xl shadow-blue-500/10 active:scale-[0.98]">
            <i className="fas fa-plus mr-2"></i> Upload Document
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="text-lg font-black text-slate-900">{files.length}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Documents</div>
            </div>
            <div 
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:border-blue-200 transition-colors"
              onClick={() => setShowLogs(!showLogs)}
            >
              <div className="text-lg font-black text-slate-900">{clusters.length}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Clusters</div>
            </div>
          </div>

          <div className="pt-2">
            <FolderView 
              files={files} 
              clusters={clusters} 
              onSelectFile={(id) => setSelectedFileId(id)}
              onDeleteFile={deleteFile}
              onRenameFile={renameFile} 
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-500/20">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate font-medium">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex bg-white relative">
        <div className={`flex-1 flex flex-col transition-all duration-500 ${showLogs ? 'mr-80' : ''}`}>
          <header className="h-20 border-b border-slate-50 flex items-center justify-between px-10 bg-white/50 backdrop-blur-md z-10 absolute top-0 left-0 right-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <i className="fas fa-network-wired text-[#3b82f6]"></i>
                Spatial Logic Map
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isProcessing && (
                <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">AI Categorizing...</span>
                </div>
              )}
              
              <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

              <button 
                onClick={() => setShowLogs(!showLogs)}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${showLogs ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                title="System Logs"
              >
                <i className="fas fa-terminal text-sm"></i>
              </button>

              <button 
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all text-[11px] font-black uppercase tracking-widest border border-slate-100"
              >
                <i className="fas fa-power-off"></i>
                Sign Out
              </button>
            </div>
          </header>

          <div className="flex-1 relative bg-[#f8fafc]">
            <FileNodeGraph 
              files={files} 
              clusters={clusters} 
              onNodeClick={(id) => setSelectedFileId(id)}
            />
          </div>
        </div>

        {/* System Monitor Panel */}
        <div className={`fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-slate-200 z-50 transition-transform duration-300 transform ${showLogs ? 'translate-x-0' : 'translate-x-full shadow-2xl'}`}>
          <div className="h-20 border-b border-slate-100 flex items-center px-8 justify-between sticky top-0 bg-white z-10">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">File Logs</h3>
            <button onClick={() => setShowLogs(false)} className="text-slate-400 hover:text-slate-600">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <OSMonitor logs={logs} />
        </div>

        {showToast && (
          <div className="fixed bottom-10 right-10 z-[100] bg-slate-900 text-white px-8 py-5 rounded-[24px] shadow-2xl flex items-center gap-5 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="w-10 h-10 rounded-full bg-[#3b82f6]/20 flex items-center justify-center">
              <i className="fas fa-sync-alt fa-spin text-[#3b82f6]"></i>
            </div>
            <div>
              <p className="text-xs font-bold mb-1">AI Re-analyzing File Content</p>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#3b82f6] animate-[progress_3s_linear]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <FileDetailModal 
        file={selectedFile || null} 
        onClose={() => setSelectedFileId(null)} 
        onDelete={() => selectedFile && deleteFile(selectedFile.id)}
        onRename={(newName) => selectedFile && renameFile(selectedFile.id, newName)}
        onSaveContent={(content) => selectedFile && updateFileContent(selectedFile.id, content)}
        isUpdating={isProcessing}
      />
    </div>
  );
};

export default App;
