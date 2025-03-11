"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { User } from './users';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileImage: string;
  onProfileImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  isAdmin: boolean;
  users: { id: number; name: string }[];
  onEditUser: (userId: number) => void;
  onDeleteUser: (userId: number) => void;
  onResetPassword: (userId: number) => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, profileImage, onProfileImageChange, onSave, isAdmin, onEditUser, onDeleteUser, onResetPassword }) => {
  const [pencilVisible, setPencilVisible] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showAccount, setShowAccount] = useState(true);
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);


  const handleDeleteUserClick = (user: User) => {
    setUserToDelete(user);
    setConfirmDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          console.error("Token não encontrado.");
          return;
        }
  
        const response = await fetch(`/api/v1/user/${userToDelete.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error(`Erro ao deletar usuário: ${response.status}`);
        }
  
        setUsers(users.filter((user) => user.id !== userToDelete.id));
        setConfirmDeleteModalOpen(false);
        setUserToDelete(null);
      } catch (error) {
        console.error("Erro ao deletar usuário", error);
      }
    }
  };

  const handleSaveUser = async () => {
    if (editingUser) {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          console.error("Token não encontrado.");
          return;
        }

        const response = await fetch(`/api/v1/user/${editingUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username:editingUser.username,
            email: editingUser.email,
            password: editingUser.password || "",
          }),
        });
        if (!response.ok) {
          throw new Error(`Erro ao salvar usuário: ${response.status}`);
        }
        setEditingUser(null);
        const updatedUsers = users.map(user => user.id === editingUser.id ? editingUser : user);
        setUsers(updatedUsers);
      } catch (error) {
        console.error("Erro ao salvar usuário", error);
      }
    }
  };

const handleEditUser = (user: User) => {
  setEditingUser(user);
};

const fetchUsers = async () => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("Token não encontrado.");
      return;
    }
    const response = await fetch("/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Erro ao buscar usuários: ${response.status}`);
    }
    const usersData = await response.json();
    setUsers(usersData);
  } catch (error) {
    console.error("Erro ao buscar usuários", error);
  }
};

  useEffect(() => {
    if (showUsers) {
      fetchUsers();
    }
  }, [showUsers]);

return (
  <>
  {isOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-xl p-6 relative">
        {/* Cabeçalho do modal */}
        <div className="flex justify-between items-center w-full mb-4">
            <h2 className="text-lg font-semibold">Configurações</h2>
            <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 bg-transparent p-2 rounded absolute top-4 right-4"
                id="button-closeModal"
              >
                <X size={20} />
              </button>
        </div>
        {/* Layout do Modal */}
        <div className="flex">
            {/* Sidebar */}
            <aside className="w-1/4 pr-4 border-r">
                <nav className="space-y-2">
                    <a 
                    href="#" 
                    className="flex items-center gap-2 text-gray-700 hover:bg-gray-100  p-2 rounded-md" 
                    onClick={() => {
                    setShowAccount(true);
                    setShowAbout(false);
                    setShowUsers(false);
                    }}
                    >
                    Conta
                    </a>
                    {isAdmin && (
                    <a
                    href="#"
                    className="flex items-center gap-2 text-gray-700  hover:bg-gray-100 p-2 rounded-md"
                    onClick={() => {
                      setShowAccount(false);
                      setShowAbout(false);
                      setShowUsers(true);
                    }}
                    >
                    Usuários
                    </a>
                    )}
                    <a
                    href="#"
                    className="flex items-center gap-2 text-gray-700 hover:bg-gray-100  p-2 rounded-md"
                    onClick={() => {
                      setShowAccount(false);
                      setShowAbout(true);
                      setShowUsers(false);
                    }}
                    >
                    Sobre
                    </a>
                </nav>
            </aside>
            {/* Conteúdo */}
            <main className="w-3/4 pl-4">
                {showAccount && (
                <>
                {/* Imagem de Perfil */}
                <div
                  className="profile-modalConfig flex-shrink-0 relative"
                  onMouseEnter={() => setPencilVisible(true)}
                  onMouseLeave={() => setPencilVisible(false)}
                >
                  <img className="profileModal" src={profileImage} alt="User" />
                  {pencilVisible && (
                    <>
                      <div
                        className="absolute top-5 left-4"
                        onClick={() => document.getElementById("uploadProfile")?.click()}
                      >
                        <img className="pen" src="./pen.png" alt="pen" />
                      </div>
                      <input
                        type="file"
                        id="uploadProfile"
                        onChange={onProfileImageChange}
                        className="absolute top-5 left-4 w-5 h-5 opacity-0"
                      />
                    </>
                  )}
                </div>
                {/* Campo de Nome */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    value="Natalia"
                    disabled
                    className="mt-1 block w-full rounded-md bg-gray-100 text-gray-800 px-3 py-2 border-none"
                  />
                </div>
                {/* Mudar Senha */}
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-700">Mudar Senha</p>
                  <span className="showHide" onClick={() => setShowChangePassword(!showChangePassword)}>
                    {showChangePassword ? "Ocultar" : "Mostrar"}
                  </span>
                </div>
                {showChangePassword && (
                  <div>
                    {/* 1. Senha atual */}
                    <div className="mb-4">
                      <label htmlFor="senhaAtual" className="block text-sm font-medium text-gray-700">
                        Senha Atual
                      </label>
                      <input
                        type="password"
                        id="senhaAtual"
                        className="mt-1 block w-full rounded-md bg-gray-100 text-gray-800 px-3 py-2 border-none"
                      />
                    </div>
                    {/* 2. Nova Senha */}
                    <div className="mb-4">
                      <label htmlFor="novaSenha" className="block text-sm font-medium text-gray-700">
                        Nova Senha
                      </label>
                      <input
                        type="password"
                        id="novaSenha"
                        className="mt-1 block w-full rounded-md bg-gray-100 text-gray-800 px-3 py-2 border-none"
                      />
                    </div>
                    {/* 3. Confirmar Senha */}
                    <div className="mb-4">
                      <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700">
                        Confirmar Nova Senha
                      </label>
                      <input
                        type="password"
                        id="confirmarSenha"
                        className="mt-1 block w-full rounded-md bg-gray-100 text-gray-800 px-3 py-2 border-none"
                      />
                    </div>
                  </div>
                )}
                {/* ... Salvar ... */}
                <div className="modal-footer">
                  <button className="save-button" onClick={onSave}>
                    Salvar
                  </button>
                </div>
              </>
            )}
            {/* ... Usuários ... */}
            {showUsers && isAdmin && (
              <div>
                {/* Lista de usuários */}
                {users.map((user) => (
                  <div key={user.id} className="user-list-item">
                    <div className="user-details">
                      <span className="user-name">{user.username}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                    <div className="user-actions">
                      <button onClick={() => handleEditUser(user)}>
                        Editar
                      </button>
                      <button onClick={() => handleDeleteUserClick(user)}>
                        Deletar
                      </button>
                      <button className="whitespace-nowrap" onClick={() => onResetPassword(user.id)}>
                        Resetar Senha
                      </button>
                    </div>
                  </div>
                ))}
                {/* Formulário de edição */}
                  {editingUser && (
                    <div className="mt-4">
                      <input
                        type="text"
                        value={editingUser.username}
                        onChange={(e) => setEditingUser({ ...editingUser, username: e.target.             value })}
                      />
                      <input
                        type="email"
                        value={editingUser.email}
                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.              value })}
                      />
                      <button onClick={handleSaveUser}>Salvar Edição</button>
                    </div>
                  )}
                {/* Botão para criar novo usuário */}
                <div className="flex justify-end mt-4">
                  <button className="text-green-500" title="Criar usuário">
                    +
                  </button>
                </div>
              </div>
            )}
            {showAbout && (
              <div className="mt-2 text-sm text-gray-600">Echo Versão v0.3.35</div>
            )}
          </main>
        </div>
        {confirmDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6">
              <p className="text-lg font-semibold mb-4">
                Tem certeza que deseja deletar o usuário {userToDelete?.username}?
              </p>
              <div className="flex justify-end">
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                  onClick={() => setConfirmDeleteModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  onClick={confirmDeleteUser}
                >
                  Deletar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )}
    </>
  );
};

export default Modal;