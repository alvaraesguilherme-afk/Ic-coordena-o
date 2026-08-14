import { BackLink } from "@/components/back-link";

const DATA_IMPLEMENTACAO = "14 de agosto de 2026";

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-5 shadow-lg shadow-black/30 backdrop-blur-xl">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">{titulo}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-white/80">{children}</div>
    </div>
  );
}

export default function TermosPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/configuracoes" label="Voltar" />

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Termos e Privacidade</h1>
        <p className="mt-1 text-sm text-white/50">
          Como o app Impulse trata seus dados pessoais, conforme a LGPD (Lei nº 13.709/2018).
          Em vigor desde {DATA_IMPLEMENTACAO}.
        </p>
      </div>

      <Secao titulo="Quem trata seus dados">
        <p>
          O app Impulse é administrado pela liderança da Rede Impulse, responsável pelas
          decisões sobre uso dos dados coletados aqui. Dúvidas ou pedidos sobre seus dados podem
          ser feitos diretamente a um líder da sua rede.
        </p>
      </Secao>

      <Secao titulo="Quais dados coletamos">
        <p>Ao criar sua conta e usar o app, guardamos:</p>
        <ul className="list-disc pl-5">
          <li>Nome, e-mail e senha (a senha é armazenada de forma criptografada)</li>
          <li>Foto de perfil</li>
          <li>Data de nascimento, telefone e endereço, quando informados</li>
          <li>Rede e IC (Igreja Casa) às quais você pertence ou lidera</li>
          <li>
            Conteúdo que você publica no app: avisos, links úteis, playlists e presença em
            escalas
          </li>
        </ul>
      </Secao>

      <Secao titulo="Por que coletamos e qual a base legal">
        <p>
          Usamos esses dados para organizar a vida da comunidade: montar escalas, avisar sobre
          eventos, manter o diretório de membros e permitir que você participe das atividades da
          sua rede e IC. O tratamento se baseia na execução do vínculo com a comunidade Impulse
          (art. 7º, V, LGPD) e, quando aplicável, no seu consentimento ao criar a conta.
        </p>
      </Secao>

      <Secao titulo="Com quem compartilhamos">
        <p>
          Não vendemos nem compartilhamos seus dados com terceiros para fins comerciais. Usamos
          dois prestadores de serviço só para operar o app:
        </p>
        <ul className="list-disc pl-5">
          <li>Supabase — banco de dados e armazenamento da foto de perfil</li>
          <li>Vercel — hospedagem do aplicativo</li>
        </ul>
        <p>
          Seu nome, foto e as informações da sua rede/IC ficam visíveis para outros membros
          logados no app, já que fazem parte do diretório interno da comunidade.
        </p>
      </Secao>

      <Secao titulo="Seus direitos">
        <p>Conforme o art. 18 da LGPD, você pode a qualquer momento:</p>
        <ul className="list-disc pl-5">
          <li>Confirmar se tratamos algum dado seu e acessá-lo</li>
          <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
          <li>Pedir a eliminação dos dados que não sejam mais necessários</li>
          <li>Solicitar a portabilidade dos seus dados a outro serviço</li>
          <li>Revogar o consentimento e apagar sua conta a qualquer momento</li>
        </ul>
        <p>
          Você mesmo pode corrigir nome e foto em <strong>Perfil</strong>, e apagar sua conta e
          dados pessoais diretamente em <strong>Configurações</strong>, sem precisar pedir a
          ninguém.
        </p>
      </Secao>

      <Secao titulo="Por quanto tempo guardamos">
        <p>
          Seus dados ficam guardados enquanto sua conta existir. Ao apagar a conta, os dados
          pessoais são removidos permanentemente do banco e a foto de perfil é removida do
          armazenamento.
        </p>
      </Secao>

      <Secao titulo="Cookies">
        <p>
          Usamos só um cookie técnico e necessário, que mantém você conectado (sessão de login).
          Não usamos cookies de rastreamento ou publicidade.
        </p>
      </Secao>
    </div>
  );
}
